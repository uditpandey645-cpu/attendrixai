import * as faceapi from "face-api.js";

let modelsLoaded = false;
let loadingPromise: Promise<void> | null = null;

export const MATCH_THRESHOLD = 0.55; // Euclidean distance threshold (lower = stricter)

export async function loadFaceModels(): Promise<void> {
  if (modelsLoaded) return;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    const MODEL_URL = "/models";
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
    modelsLoaded = true;
  })();

  return loadingPromise;
}

/** Detect a single best face and return its 128-d descriptor. */
export async function getSingleFaceDescriptor(
  input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
): Promise<Float32Array | null> {
  await loadFaceModels();
  const result = await faceapi
    .detectSingleFace(input, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
    .withFaceLandmarks()
    .withFaceDescriptor();
  return result?.descriptor ?? null;
}

export interface DetectedFace {
  descriptor: Float32Array;
  box: { x: number; y: number; width: number; height: number };
}

/** Detect all faces in an image and return descriptors with bounding boxes. */
export async function getAllFaceDescriptors(
  input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
): Promise<DetectedFace[]> {
  await loadFaceModels();
  const results = await faceapi
    .detectAllFaces(input, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
    .withFaceLandmarks()
    .withFaceDescriptors();
  return results.map((r) => ({
    descriptor: r.descriptor,
    box: r.detection.box,
  }));
}

/** Euclidean distance between two embeddings (face-api standard). */
export function euclideanDistance(a: Float32Array | number[], b: Float32Array | number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    sum += d * d;
  }
  return Math.sqrt(sum);
}

export interface StoredEmbedding {
  profile_id: string;
  embedding: number[];
}

export interface MatchResult {
  profileId: string;
  distance: number;
  confidence: number;
  faceIndex: number;
  box: { x: number; y: number; width: number; height: number };
}

/**
 * Match each detected face against stored embeddings.
 * Ensures each profile is matched to at most one face (best match wins).
 */
export function matchFaces(
  detectedFaces: DetectedFace[],
  storedEmbeddings: StoredEmbedding[],
  threshold: number = MATCH_THRESHOLD
): MatchResult[] {
  type Candidate = { faceIndex: number; profileId: string; distance: number; box: DetectedFace["box"] };
  const candidates: Candidate[] = [];

  detectedFaces.forEach((face, faceIndex) => {
    storedEmbeddings.forEach((stored) => {
      const distance = euclideanDistance(face.descriptor, stored.embedding);
      if (distance <= threshold) {
        candidates.push({ faceIndex, profileId: stored.profile_id, distance, box: face.box });
      }
    });
  });

  // Sort by best match first
  candidates.sort((a, b) => a.distance - b.distance);

  const usedFaces = new Set<number>();
  const usedProfiles = new Set<string>();
  const matches: MatchResult[] = [];

  for (const c of candidates) {
    if (usedFaces.has(c.faceIndex) || usedProfiles.has(c.profileId)) continue;
    usedFaces.add(c.faceIndex);
    usedProfiles.add(c.profileId);
    matches.push({
      profileId: c.profileId,
      distance: c.distance,
      confidence: Math.max(0, 1 - c.distance / threshold),
      faceIndex: c.faceIndex,
      box: c.box,
    });
  }

  return matches;
}

/** Load an HTMLImageElement from a data URL or blob URL. */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

import * as faceapi from "face-api.js";

let modelsLoaded = false;
let loadingPromise: Promise<void> | null = null;

// Euclidean distance threshold (lower = stricter). 0.5–0.6 is the standard range.
export const MATCH_THRESHOLD = 0.55;

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

/** Single best face — uses SSD for higher accuracy on registration. */
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

/**
 * Detect all faces in an image. Uses TinyFaceDetector for speed on group photos
 * and falls back to SSD if too few are found, ensuring 5+ multi-person support.
 */
export async function getAllFaceDescriptors(
  input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
): Promise<DetectedFace[]> {
  await loadFaceModels();

  // Pass 1: fast TinyFaceDetector with larger inputSize for group photos
  const tinyResults = await faceapi
    .detectAllFaces(
      input,
      new faceapi.TinyFaceDetectorOptions({ inputSize: 608, scoreThreshold: 0.5 })
    )
    .withFaceLandmarks()
    .withFaceDescriptors();

  if (tinyResults.length >= 2) {
    return tinyResults.map((r) => ({
      descriptor: r.descriptor,
      box: r.detection.box,
    }));
  }

  // Pass 2: SSD fallback (more accurate, slower) for tricky/single-face shots
  const ssdResults = await faceapi
    .detectAllFaces(input, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.4 }))
    .withFaceLandmarks()
    .withFaceDescriptors();

  const best = ssdResults.length > tinyResults.length ? ssdResults : tinyResults;
  return best.map((r) => ({
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
 * Match each detected face against stored embeddings using Hungarian-style
 * greedy assignment: each face → at most one profile, each profile → at most one face.
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

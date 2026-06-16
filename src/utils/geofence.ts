// Geofencing for staff check-in / check-out.
//
// Teachers must be physically on campus to record attendance. We read the
// device GPS at the moment of the action and reject it if it falls outside a
// radius around the school. This is what stops "check-in from home".
//
// ─────────────────────────────────────────────────────────────────────────
// HOW TO SET SCHOOL_LOCATION (one-time, ~10 seconds):
//   1. Open the campus in Google Maps (the share link you have).
//   2. Right-click the exact spot on the building / gate.
//   3. The very first line of the menu is two numbers, e.g. "12.971599, 77.594566"
//      — that's "latitude, longitude". Click it to copy.
//   4. Paste them below. (Decimals matter — keep all of them.)
// Until you do this, the coordinates below are a PLACEHOLDER and check-in
// will be blocked everywhere. See ENFORCE_GEOFENCE to disable temporarily.
// ─────────────────────────────────────────────────────────────────────────

export interface SchoolLocation {
  lat: number;
  lng: number;
  /** Allowed distance from the point above, in metres. */
  radiusMeters: number;
}

// Campus: 1737, TNHB Rd, TNHB Colony, Annanur, Ayappakkam, Chennai 600077.
// Set 2026-06-15 from the exact building pin (Google Maps dropped-pin link).
export const SCHOOL_LOCATION: SchoolLocation = {
  lat: 13.106517,
  lng: 80.131941,
  radiusMeters: 120,
};

// Master switch. Set to false to fall back to the old QR-only behaviour
// (e.g. if GPS is causing problems on a given day) without ripping out code.
export const ENFORCE_GEOFENCE = true;

// Phone GPS is noisy. If the reported accuracy is worse than this many metres
// we don't trust it enough to reject someone who might actually be on-site, so
// we treat the fix as unusable and ask them to retry rather than hard-blocking.
const MAX_ACCEPTABLE_ACCURACY_M = 75;

// Haversine great-circle distance between two lat/lng points, in metres.
export const distanceMeters = (
  aLat: number, aLng: number, bLat: number, bLng: number,
): number => {
  const R = 6371000; // Earth radius in metres
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const lat1 = toRad(aLat);
  const lat2 = toRad(bLat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

export interface GeofenceResult {
  ok: boolean;
  /** Distance from the school in metres (rounded), when a fix was obtained. */
  distanceMeters?: number;
  /** Reported GPS accuracy in metres, when a fix was obtained. */
  accuracyMeters?: number;
  lat?: number;
  lng?: number;
  /** Human-readable reason shown to the teacher when ok === false. */
  reason?: string;
}

// Read the device location once and check it against the school geofence.
// Resolves (never rejects) so the caller can show a friendly message.
export const checkWithinSchool = (): Promise<GeofenceResult> =>
  new Promise((resolve) => {
    if (!ENFORCE_GEOFENCE) {
      resolve({ ok: true });
      return;
    }

    if (SCHOOL_LOCATION.lat === 0 && SCHOOL_LOCATION.lng === 0) {
      resolve({
        ok: false,
        reason:
          'School location is not configured yet. Ask the admin to set the campus coordinates.',
      });
      return;
    }

    if (!('geolocation' in navigator)) {
      resolve({
        ok: false,
        reason: 'This device cannot share its location, so check-in is blocked.',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;

        if (accuracy != null && accuracy > MAX_ACCEPTABLE_ACCURACY_M) {
          resolve({
            ok: false,
            accuracyMeters: Math.round(accuracy),
            lat: latitude,
            lng: longitude,
            reason:
              `Your GPS signal is weak (±${Math.round(accuracy)} m). ` +
              'Step outside or wait a moment, then try again.',
          });
          return;
        }

        const dist = distanceMeters(
          latitude, longitude, SCHOOL_LOCATION.lat, SCHOOL_LOCATION.lng,
        );
        const within = dist <= SCHOOL_LOCATION.radiusMeters;
        resolve({
          ok: within,
          distanceMeters: Math.round(dist),
          accuracyMeters: accuracy != null ? Math.round(accuracy) : undefined,
          lat: latitude,
          lng: longitude,
          reason: within
            ? undefined
            : `You appear to be ${Math.round(dist)} m from school. ` +
              `You must be within ${SCHOOL_LOCATION.radiusMeters} m of campus to check in.`,
        });
      },
      (err) => {
        const reason =
          err.code === err.PERMISSION_DENIED
            ? 'Location permission was denied. Please allow location access to check in.'
            : 'Could not read your location. Make sure GPS is on and try again.';
        resolve({ ok: false, reason });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  });

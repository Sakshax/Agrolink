import { collection, getDocs, addDoc, updateDoc, doc, query, where } from "firebase/firestore";
import { db } from "./config";
import { coursesData, jobsData, marketPrices } from "../data/mockData";

// ─── Courses ──────────────────────────────────────────────────────

export const getCourses = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "courses"));

    if (querySnapshot.empty) {
      console.log("Seeding courses…");
      for (const c of coursesData) {
        await addDoc(collection(db, "courses"), c);
      }
      return coursesData.map(c => ({ ...c }));
    }

    // Deduplicate docs based on numeric ID (in case of double seeding during HMR)
    const uniqueDocsMap = new Map();
    querySnapshot.docs.forEach((document) => {
      const data = document.data();
      // Keep only one doc per course ID
      if (!uniqueDocsMap.has(data.id)) {
        uniqueDocsMap.set(data.id, {
          firestoreId: document.id,
          ...data
        });
      }
    });

    // Automatically seed any courses that are in coursesData but missing from Firestore
    const missingCourses = coursesData.filter(c => !uniqueDocsMap.has(c.id));
    for (const c of missingCourses) {
      console.log(`Seeding missing course: ${c.id}`);
      try {
        // Create an independent copy to upload
        const courseDataToSeed = { ...c };
        const docRef = await addDoc(collection(db, "courses"), courseDataToSeed);
        uniqueDocsMap.set(c.id, { firestoreId: docRef.id, ...courseDataToSeed });
      } catch (e) {
        console.error("Failed to seed new course:", e);
      }
    }

    // Merge: base is coursesData so we never miss local courses
    const mergedCourses = coursesData.map(localCourse => {
      const remote = uniqueDocsMap.get(localCourse.id) || {};
      return {
        ...localCourse,     // base properties (thumbnails, videoUrl etc.)
        progress: remote.progress !== undefined ? remote.progress : localCourse.progress,
        id: localCourse.id, // canonical course ID
        firestoreId: remote.firestoreId || null,
      };
    });
    
    // Sort courses by ID asc
    return mergedCourses.sort((a, b) => (a.id || 0) - (b.id || 0));
  } catch (err) {
    console.error("getCourses error:", err);
    // Fallback to local data so the app never white-screens
    return coursesData.map(c => ({ ...c }));
  }
};

export const updateCourseProgress = async (numericCourseId, progress) => {
  try {
    const q = query(
      collection(db, "courses"),
      where("id", "==", numericCourseId)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.warn("No Firestore doc found for course id:", numericCourseId);
      return;
    }

    const batch = snapshot.docs.map((document) =>
      updateDoc(doc(db, "courses", document.id), { progress })
    );
    await Promise.all(batch);
  } catch (err) {
    console.error("updateCourseProgress error:", err);
  }
};

// ─── Jobs ─────────────────────────────────────────────────────────

export const getJobs = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "jobs"));
    
    if (querySnapshot.empty) {
      console.log("Seeding jobs…");
      for (const j of jobsData) await addDoc(collection(db, "jobs"), j);
      return jobsData;
    }

    // Deduplicate docs based on numeric ID
    const uniqueJobsMap = new Map();
    querySnapshot.docs.forEach((document) => {
      const data = document.data();
      if (!uniqueJobsMap.has(data.id)) {
        uniqueJobsMap.set(data.id, { firestoreId: document.id, ...data });
      }
    });

    // Automatically seed missing jobs locally present
    const missingJobs = jobsData.filter(j => !uniqueJobsMap.has(j.id));
    for (const j of missingJobs) {
      console.log(`Seeding missing job: ${j.id}`);
      try {
        const jobDataToSeed = { ...j };
        const docRef = await addDoc(collection(db, "jobs"), jobDataToSeed);
        uniqueJobsMap.set(j.id, {  firestoreId: docRef.id, ...jobDataToSeed });
      } catch (e) {
        console.error("Failed to seed new job:", e);
      }
    }

    const mergedJobs = jobsData.map(localJob => {
      const remote = uniqueJobsMap.get(localJob.id) || {};
      return {
        ...remote,
        ...localJob,
        id: localJob.id,
        firestoreId: remote.firestoreId || null,
      };
    });

    return mergedJobs.sort((a, b) => (a.id || 0) - (b.id || 0));
  } catch (err) {
    console.error("getJobs error:", err);
    return jobsData;
  }
};

// ─── Market Prices ────────────────────────────────────────────────

export const getMarketPrices = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "marketPrices"));
    if (querySnapshot.empty) {
      console.log("Seeding prices…");
      for (const p of marketPrices) await addDoc(collection(db, "marketPrices"), p);
      return marketPrices;
    }
    
    // Deduplicate docs based on numeric ID (in case of double seeding)
    const uniquePricesMap = new Map();
    querySnapshot.docs.forEach((document) => {
      const data = document.data();
      if (!uniquePricesMap.has(data.id)) {
        uniquePricesMap.set(data.id, { firestoreId: document.id, ...data });
      }
    });
    
    return Array.from(uniquePricesMap.values()).sort((a, b) => (a.id || 0) - (b.id || 0));
  } catch (err) {
    console.error("getMarketPrices error:", err);
    return marketPrices;
  }
};

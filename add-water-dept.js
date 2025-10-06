// Add Water & Sanitation department to Firebase
const { initializeApp } = require('firebase/app')
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth')
const { getFirestore, doc, setDoc } = require('firebase/firestore')

const firebaseConfig = {
  apiKey: "AIzaSyAcYQEgQFSkDK2zJwhr_tEVTywYc-sXXMQ",
  authDomain: "fir-auth-3694c.firebaseapp.com",
  projectId: "fir-auth-3694c",
  storageBucket: "fir-auth-3694c.appspot.com",
  messagingSenderId: "1004112228354",
  appId: "1:1004112228354:web:6683533badd21ed9ff371b"
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

const waterDept = {
  id: 'water',
  name: 'Water Supply & Sewage',
  email: 'water@civic.gov',
  password: 'password123',
  description: 'Water leaks, pipe bursts, sewage blockage, drainage problems'
}

async function addWaterDepartment() {
  try {
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, waterDept.email, waterDept.password)
    const user = userCredential.user
    
    console.log(`✅ Created auth user for ${waterDept.name}: ${user.uid}`)
    
    // Create user document
    await setDoc(doc(db, 'users', user.uid), {
      name: waterDept.name,
      email: waterDept.email,
      department: {
        id: waterDept.id,
        name: waterDept.name
      },
      departmentId: waterDept.id,
      departmentName: waterDept.name,
      role: 'department_admin',
      userRole: 'Department',
      description: waterDept.description,
      profileImage: '/placeholder.svg',
      createdAt: new Date().toISOString(),
      active: true,
      postCount: 0,
      followersCount: 0,
      followingCount: 0
    })
    
    // Create civicUsers document
    await setDoc(doc(db, 'civicUsers', user.uid), {
      uid: user.uid,
      name: waterDept.name,
      email: waterDept.email,
      role: 'department_admin',
      departmentName: waterDept.name,
      departmentId: waterDept.id,
      profileImage: '/placeholder.svg',
      active: true,
      createdAt: new Date().toISOString()
    })
    
    console.log(`✅ Water & Sanitation department added successfully!`)
    console.log(`Login: ${waterDept.email} / ${waterDept.password}`)
    
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log(`⚠️ Water department account already exists`)
    } else {
      console.error(`❌ Error:`, error.message)
    }
  }
}

addWaterDepartment()
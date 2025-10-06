// Create Water & Sanitation department user in Firebase
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

async function createWaterUser() {
  const email = 'watersanitation@civic.gov'
  const password = 'password123'
  
  try {
    console.log('Creating Water & Sanitation department user...')
    
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    
    console.log(`✅ Created Firebase Auth user: ${user.uid}`)
    
    // Create users document
    await setDoc(doc(db, 'users', user.uid), {
      name: 'Water Supply & Sewage',
      email: email,
      department: {
        id: 'water',
        name: 'Water Supply & Sewage'
      },
      departmentId: 'water',
      departmentName: 'Water Supply & Sewage',
      role: 'department_admin',
      userRole: 'Department',
      description: 'Water leaks, pipe bursts, sewage blockage, drainage problems',
      profileImage: '/placeholder.svg',
      createdAt: new Date().toISOString(),
      active: true,
      postCount: 0,
      followersCount: 0,
      followingCount: 0
    })
    
    console.log('✅ Created users document')
    
    // Create civicUsers document
    await setDoc(doc(db, 'civicUsers', user.uid), {
      uid: user.uid,
      name: 'Water Supply & Sewage',
      email: email,
      role: 'department_admin',
      departmentName: 'Water Supply & Sewage',
      departmentId: 'water',
      profileImage: '/placeholder.svg',
      active: true,
      createdAt: new Date().toISOString()
    })
    
    console.log('✅ Created civicUsers document')
    
    console.log('\n🎉 Water & Sanitation department created successfully!')
    console.log(`📧 Email: ${email}`)
    console.log(`🔑 Password: ${password}`)
    console.log(`🆔 UID: ${user.uid}`)
    
  } catch (error) {
    console.error('❌ Error creating user:', error.message)
    if (error.code === 'auth/email-already-in-use') {
      console.log('Email already exists. Try using a different email or delete the existing user first.')
    }
  }
}

createWaterUser()
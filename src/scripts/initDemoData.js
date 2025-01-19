import { 
  collection,
  doc,
  setDoc,
  Timestamp,
  getFirestore 
} from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

const generateDailyMetrics = (userId, date) => {
  const metrics = [];
  const suppliers = [1, 2, 3, 4, 5];

  for (const supplierId of suppliers) {
    const dailySales = Math.floor(Math.random() * (89 - 25 + 1)) + 25;
    const marginPercent = Math.random() * (0.30 - 0.20) + 0.20;

    metrics.push({
      userId,
      supplierId,
      quantity: supplierId === 5 ? 90 : Math.floor(Math.random() * 100),
      salesAmount: supplierId !== 5 ? dailySales : 0,
      marginAmount: supplierId !== 5 ? Math.floor(dailySales * marginPercent) : 0,
      date: Timestamp.fromDate(date)
    });
  }

  return metrics;
};

export const initializeDemoData = async (auth, db) => {
  const demoUsers = [
    {
      email: import.meta.env.VITE_ADMIN_EMAIL,
      password: 'Test12',
      name: 'Matt Early',
      role: 'admin',
      storeId: 'store1',
      regionId: 'region1'
    },
    {
      email: 'john.smith@demo.com',
      password: 'Demo123',
      name: 'John Smith',
      role: 'salesperson',
      storeId: 'store1',
      regionId: 'region1'
    },
    {
      email: 'sarah.jones@demo.com',
      password: 'Demo123',
      name: 'Sarah Jones',
      role: 'salesperson',
      storeId: 'store1',
      regionId: 'region1'
    },
    {
      email: 'mike.wilson@demo.com',
      password: 'Demo123',
      name: 'Mike Wilson',
      role: 'salesperson',
      storeId: 'store2',
      regionId: 'region1'
    }
  ];

  try {
    // Create users and their profiles
    for (const user of demoUsers) {
      try {
        // Create Firebase Auth user
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          user.email,
          user.password
        );

        // Create user profile
        const userProfileRef = doc(db, 'users', userCredential.user.uid);
        await setDoc(userProfileRef, {
          email: user.email,
          name: user.name,
          role: user.role,
          storeId: user.storeId,
          regionId: user.regionId,
          approved: true,
          createdAt: Timestamp.now()
        });

        // Generate last week's metrics for each user
        if (user.role === 'salesperson') {
          const metricsRef = collection(db, 'metrics');
          const today = new Date(2023, 11, 9); // December 9, 2023

          for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            const dailyMetrics = generateDailyMetrics(userCredential.user.uid, date);
            
            for (const metric of dailyMetrics) {
              await setDoc(doc(metricsRef), metric);
            }
          }
        }
      } catch (error) {
        console.error(`Error creating user ${user.email}:`, error);
        // Continue with next user
      }
    }

    console.log('Demo data initialized successfully');
  } catch (error) {
    console.error('Error initializing demo data:', error);
    throw error;
  }
};
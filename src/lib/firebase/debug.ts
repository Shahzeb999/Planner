// Firebase debugging utilities
import firebaseConfig from './config';

export function debugFirebaseConfig() {
  console.log('🔥 Firebase Debug Information:');
  console.log('================================');
  
  const config = {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 8)}...` : 'MISSING',
    appId: firebaseConfig.appId ? `${firebaseConfig.appId.substring(0, 20)}...` : 'MISSING',
  };
  
  console.table(config);
  
  // Check for common issues
  const issues = [];
  
  if (!firebaseConfig.projectId) {
    issues.push('❌ Missing projectId');
  } else if (firebaseConfig.projectId === 'your_project_id') {
    issues.push('❌ projectId not updated from template');
  }
  
  if (!firebaseConfig.authDomain) {
    issues.push('❌ Missing authDomain');
  }
  
  if (!firebaseConfig.apiKey) {
    issues.push('❌ Missing apiKey');
  }
  
  if (!firebaseConfig.appId) {
    issues.push('❌ Missing appId');
  }
  
  if (issues.length > 0) {
    console.error('🚨 Configuration Issues Found:');
    issues.forEach(issue => console.error(issue));
  } else {
    console.log('✅ Configuration looks good!');
  }
  
  console.log('📝 Next steps if you see "configuration-not-found":');
  console.log('1. Go to Firebase Console > Authentication');
  console.log('2. Click "Get started" to enable Authentication');
  console.log('3. Enable Email/Password provider');
  console.log('4. Refresh your app');
}

// Auto-debug in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  debugFirebaseConfig();
}

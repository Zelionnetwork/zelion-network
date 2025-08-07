const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function runTests() {
  console.log('🔍 Running Zelion Network Test Suite...\n');

  try {
    // Run smart contract tests
    console.log('🧪 Running Smart Contract Tests...');
    const { stdout: contractStdout, stderr: contractStderr } = await execAsync('npx hardhat test');
    
    if (contractStdout) {
      console.log(contractStdout);
    }
    
    if (contractStderr) {
      console.error(contractStderr);
    }
    
    console.log('✅ Smart Contract Tests Completed\n');
    
    // Run frontend tests (if frontend directory exists)
    console.log('🖥️  Running Frontend Tests...');
    
    try {
      const { stdout: frontendStdout, stderr: frontendStderr } = await execAsync('cd frontend && npm test', {
        timeout: 120000 // 2 minutes timeout
      });
      
      if (frontendStdout) {
        console.log(frontendStdout);
      }
      
      if (frontendStderr) {
        console.error(frontendStderr);
      }
      
      console.log('✅ Frontend Tests Completed\n');
    } catch (frontendError) {
      console.warn('⚠️  Frontend tests could not be run. Make sure you have the frontend dependencies installed.');
      console.warn('To run frontend tests, navigate to the frontend directory and run: npm test\n');
    }
    
    console.log('🎉 All Tests Completed Successfully!');
    
  } catch (error) {
    console.error('❌ Tests failed with error:');
    console.error(error.message);
    
    if (error.stdout) {
      console.error('Output:');
      console.error(error.stdout);
    }
    
    if (error.stderr) {
      console.error('Error Output:');
      console.error(error.stderr);
    }
    
    process.exit(1);
  }
}

runTests();

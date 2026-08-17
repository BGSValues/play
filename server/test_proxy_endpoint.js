import axios from 'axios';

async function testProxyEndpoint() {
  const testUrl = 'https://static.wikia.nocookie.net/bubble-gum-simulator/images/1/14/Dominus_Hydra.png/revision/latest?cb=20190118052343';
  const proxyTarget = `http://localhost:5000/api/proxy-image?url=${encodeURIComponent(testUrl)}`;

  console.log('[Test] Testing proxy target:', proxyTarget);

  try {
    const res = await axios.get(proxyTarget, { responseType: 'arraybuffer' });
    console.log('[Test SUCCESS] Status:', res.status, 'Content-Type:', res.headers['content-type'], 'Buffer size:', res.data.length);
  } catch (err) {
    console.error('[Test FAILED]:', err.message);
  }
}

testProxyEndpoint();

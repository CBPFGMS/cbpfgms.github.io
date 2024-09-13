const url = "https://cbpfapi.unocha.org/vo2/odata/ContributionTotal?$format=csv&ShowAllPooledFunds=1";

async function measureApiCall(url) {
  const startTime = performance.now();

  try {
    const response = await fetch(url);
    const responseTime = performance.now() - startTime;

    const downloadStartTime = performance.now();
    const data = await response.text(); // Or other appropriate method
    const downloadTime = performance.now() - downloadStartTime;

    console.log(`Latency: ${responseTime.toFixed(2)} ms`);
    console.log(`Download time: ${downloadTime.toFixed(2)} ms`);

    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

measureApiCall(url);

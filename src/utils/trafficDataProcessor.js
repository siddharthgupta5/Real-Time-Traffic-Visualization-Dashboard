export function processTrafficData(rawData) {
    return new Promise((resolve) => {
      const process = () => {
        // Simulate heavy processing
        const processedData = rawData.map(item => {
          // Calculate congestion score (0-100)
          let congestionScore;
          if (item.congestion === 'high') {
            congestionScore = Math.min(100, Math.floor(70 + Math.random() * 30));
          } else if (item.congestion === 'medium') {
            congestionScore = Math.floor(30 + Math.random() * 40);
          } else {
            congestionScore = Math.floor(Math.random() * 30);
          }
          
          // Calculate estimated travel time (in minutes)
          const baseTime = item.name.length; // Just for demo
          const travelTime = baseTime * (1 + congestionScore / 100);
          
          return {
            ...item,
            congestionScore,
            travelTime: travelTime.toFixed(1),
            vehicles: item.vehicles || Math.floor(congestionScore / 2)
          };
        });
        
        resolve(processedData);
      };
      
      // Use Background Tasks API if available
      if (typeof window !== 'undefined' && window.requestIdleCallback) {
        window.requestIdleCallback(process, { timeout: 2000 });
      } else {
        // Fallback to setTimeout
        setTimeout(process, 0);
      }
    });
  }
  
  export function generateMockTrafficData(center, radius = 0.02) {
    const roads = [];
    const roadNames = [
      "MG Road", "Brigade Road", "Residency Road", "Church Street", 
      "Commercial Street", "Hosur Road", "Old Airport Road", 
      "Outer Ring Road", "Bannerghatta Road", "Kanakapura Road"
    ];
    
    // Convert center to Cartesian coordinates for calculations
    const centerX = 0.5;
    const centerY = 0.5;
    
    for (let i = 0; i < 12; i++) {
      // Generate roads radiating from center
      const angle = (i / 12) * Math.PI * 2;
      const length = 0.3 + Math.random() * 0.4;
      
      const startX = centerX + Math.cos(angle) * radius;
      const startY = centerY + Math.sin(angle) * radius;
      const endX = centerX + Math.cos(angle) * length;
      const endY = centerY + Math.sin(angle) * length;
      
      // Random congestion level weighted toward center
      const distFromCenter = Math.sqrt(
        Math.pow((startX + endX) / 2 - centerX, 2) + 
        Math.pow((startY + endY) / 2 - centerY, 2)
      );
      
      let congestion;
      if (distFromCenter < 0.2) {
        congestion = Math.random() > 0.3 ? 'high' : 'medium';
      } else if (distFromCenter < 0.4) {
        congestion = Math.random() > 0.6 ? 'high' : 
                    Math.random() > 0.3 ? 'medium' : 'low';
      } else {
        congestion = Math.random() > 0.8 ? 'medium' : 'low';
      }
      
      roads.push({
        id: `road-${i}`,
        name: roadNames[i % roadNames.length] || `Road ${i + 1}`,
        startX: startX * 800,
        startY: startY * 400,
        endX: endX * 800,
        endY: endY * 400,
        congestion,
        vehicles: Math.floor(Math.random() * 50) + 5
      });
    }
    
    // Add some cross streets
    for (let i = 0; i < 4; i++) {
      const angle = Math.PI / 4 + (i / 4) * Math.PI / 2;
      const length = 0.4 + Math.random() * 0.3;
      
      roads.push({
        id: `cross-${i}`,
        name: `Cross Street ${i + 1}`,
        startX: (centerX + Math.cos(angle) * length) * 800,
        startY: (centerY + Math.sin(angle) * length) * 400,
        endX: (centerX - Math.cos(angle) * length) * 800,
        endY: (centerY - Math.sin(angle) * length) * 400,
        congestion: Math.random() > 0.7 ? 'high' : 
                  Math.random() > 0.4 ? 'medium' : 'low',
        vehicles: Math.floor(Math.random() * 40) + 5
      });
    }
    
    return roads;
  }
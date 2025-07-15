import { useEffect, useRef, useState } from 'react';

export default function TrafficVisualizer({ trafficData, position }) {
  const canvasRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [processedData, setProcessedData] = useState(null);
  const [hoveredRoad, setHoveredRoad] = useState(null);

  // Intersection Observer API implementation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (canvasRef.current) {
      observer.observe(canvasRef.current);
    }

    return () => {
      if (canvasRef.current) {
        observer.unobserve(canvasRef.current);
      }
    };
  }, []);

  // Process data when visible using Background Tasks API
  useEffect(() => {
    if (visible && trafficData) {
      const processData = () => {
        const processed = trafficData.map(item => ({
          ...item,
          width: getRoadWidth(item.congestion),
          color: getCongestionColor(item.congestion)
        }));
        setProcessedData(processed);
      };

      if (typeof window !== 'undefined' && window.requestIdleCallback) {
        window.requestIdleCallback(processData, { timeout: 1000 });
      } else {
        processData();
      }
    }
  }, [visible, trafficData]);

  // Canvas API implementation
  useEffect(() => {
    if (!processedData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    const updateCanvasSize = () => {
      const container = canvas.parentElement;
      canvas.width = container.clientWidth;
      canvas.height = Math.min(container.clientWidth * 0.6, 500);
    };
    
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    
    // Draw function
    const draw = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw background
      ctx.fillStyle = '#f8f9fa';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw roads
      processedData.forEach(road => {
        ctx.beginPath();
        ctx.moveTo(road.startX * (canvas.width / 800), road.startY * (canvas.height / 400));
        ctx.lineTo(road.endX * (canvas.width / 800), road.endY * (canvas.height / 400));
        ctx.strokeStyle = road.color;
        ctx.lineWidth = road.width;
        ctx.lineCap = 'round';
        ctx.stroke();
      });
      
      // Draw hover effect
      if (hoveredRoad) {
        const road = processedData.find(r => r.id === hoveredRoad);
        if (road) {
          ctx.beginPath();
          ctx.moveTo(road.startX * (canvas.width / 800), road.startY * (canvas.height / 400));
          ctx.lineTo(road.endX * (canvas.width / 800), road.endY * (canvas.height / 400));
          ctx.strokeStyle = '#333';
          ctx.lineWidth = road.width + 2;
          ctx.lineCap = 'round';
          ctx.stroke();
          
          // Draw tooltip
          const midX = (road.startX + road.endX) / 2 * (canvas.width / 800);
          const midY = (road.startY + road.endY) / 2 * (canvas.height / 400);
          
          ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
          ctx.beginPath();
          ctx.roundRect(midX - 60, midY - 40, 120, 30, 5);
          ctx.fill();
          
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(road.name, midX, midY - 25);
          
          ctx.font = '10px Arial';
          ctx.fillText(`${road.congestion} traffic`, midX, midY - 10);
        }
      }
      
      // Draw legend
      drawLegend(ctx, canvas.width - 160, 20);
    };
    
    draw();
    
    // Add mouse interaction
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Check if mouse is over any road
      for (const road of processedData) {
        if (isPointNearLine(
          x, y,
          road.startX * (canvas.width / 800), 
          road.startY * (canvas.height / 400),
          road.endX * (canvas.width / 800), 
          road.endY * (canvas.height / 400),
          road.width + 5
        )) {
          setHoveredRoad(road.id);
          draw();
          return;
        }
      }
      
      if (hoveredRoad) {
        setHoveredRoad(null);
        draw();
      }
    };
    
    canvas.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [processedData, hoveredRoad]);

  // Helper functions
  const getCongestionColor = (level) => {
    switch(level) {
      case 'high': return '#e53935';
      case 'medium': return '#fb8c00';
      case 'low': return '#43a047';
      default: return '#757575';
    }
  };

  const getRoadWidth = (level) => {
    switch(level) {
      case 'high': return 8;
      case 'medium': return 5;
      case 'low': return 3;
      default: return 2;
    }
  };

  const drawLegend = (ctx, x, y) => {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.roundRect(x, y, 140, 110, 8);
    ctx.fill();
    ctx.strokeStyle = '#ddd';
    ctx.stroke();
    
    ctx.fillStyle = '#333';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Traffic Legend', x + 10, y + 20);
    
    // High congestion
    ctx.beginPath();
    ctx.moveTo(x + 10, y + 40);
    ctx.lineTo(x + 40, y + 40);
    ctx.strokeStyle = '#e53935';
    ctx.lineWidth = 8;
    ctx.stroke();
    ctx.fillText('High', x + 50, y + 44);
    
    // Medium congestion
    ctx.beginPath();
    ctx.moveTo(x + 10, y + 60);
    ctx.lineTo(x + 40, y + 60);
    ctx.strokeStyle = '#fb8c00';
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.fillText('Medium', x + 50, y + 64);
    
    // Low congestion
    ctx.beginPath();
    ctx.moveTo(x + 10, y + 80);
    ctx.lineTo(x + 40, y + 80);
    ctx.strokeStyle = '#43a047';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillText('Low', x + 50, y + 84);
  };

  const isPointNearLine = (px, py, x1, y1, x2, y2, radius) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    const dot = ((px - x1) * dx + (py - y1) * dy) / (length * length);
    
    if (dot < 0 || dot > 1) return false;
    
    const closestX = x1 + dot * dx;
    const closestY = y1 + dot * dy;
    const distance = Math.sqrt(Math.pow(px - closestX, 2) + Math.pow(py - closestY, 2));
    
    return distance <= radius;
  };

  return (
    <div className="traffic-visualizer">
      <div className="api-tags">
        <span className="api-tag">
          Using <strong>Canvas API</strong>
        </span>
        <span className="api-tag">
          Using <strong>Intersection Observer API</strong>
        </span>
      </div>
      <div className="canvas-container">
        <canvas 
          ref={canvasRef} 
          style={{ 
            width: '100%',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
            cursor: hoveredRoad ? 'pointer' : 'default'
          }}
        ></canvas>
      </div>
      
      {hoveredRoad && (
        <div className="road-tooltip">
          Hover over roads to see details
        </div>
      )}
    </div>
  );
}
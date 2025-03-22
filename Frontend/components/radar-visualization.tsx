
import React, { useEffect, useRef } from 'react';

export function RadarVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Ensure canvas size is set correctly for high DPI displays
    const setCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };
    
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);
    
    // Animation variables
    let rotation = 0;
    let hue = 120; // Green
    
    const createRadialGradient = () => {
      const centerX = canvas.width / (2 * (window.devicePixelRatio || 1));
      const centerY = canvas.height / (2 * (window.devicePixelRatio || 1));
      const radius = Math.min(centerX, centerY);
      
      const gradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, radius
      );
      
      gradient.addColorStop(0, `rgba(172, 255, 127, 0.8)`);
      gradient.addColorStop(0.2, `rgba(172, 255, 127, 0.5)`);
      gradient.addColorStop(0.4, `rgba(172, 255, 127, 0.2)`);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      return gradient;
    };
    
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));
      
      const centerX = canvas.width / (2 * (window.devicePixelRatio || 1));
      const centerY = canvas.height / (2 * (window.devicePixelRatio || 1));
      const radius = Math.min(centerX, centerY) * 0.9;
      
      // Draw outer circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(172, 255, 127, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Draw middle circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 0.7, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(172, 255, 127, 0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Draw inner circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 0.4, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(172, 255, 127, 0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Draw center point
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 0.05, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(172, 255, 127, 0.8)';
      ctx.fill();
      
      // Draw text around the outer circle
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation);
      
      const text = "SOTLX E00 OOEE5 RAOF . BET TBPI IA . MCH ESCDEERE ΦSB5 . JBELELEVI 1 0C 00 EE65 TL PRGOBI XA5DS . 8S0 . ELICOI VGR GSB3EEFEBABOT75B";
      ctx.font = "6px monospace";
      ctx.fillStyle = 'rgba(172, 255, 127, 0.7)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      for (let i = 0; i < text.length; i++) {
        const angle = (i / text.length) * Math.PI * 2;
        const x = Math.cos(angle) * (radius + 10);
        const y = Math.sin(angle) * (radius + 10);
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle + Math.PI / 2);
        ctx.fillText(text[i], 0, 0);
        ctx.restore();
      }
      
      // Draw spikes
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const innerRadius = radius * 0.4;
        const outerRadius = radius * 0.9;
        
        const startX = Math.cos(angle) * innerRadius;
        const startY = Math.sin(angle) * innerRadius;
        const endX = Math.cos(angle) * outerRadius;
        const endY = Math.sin(angle) * outerRadius;
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = `rgba(172, 255, 127, ${0.3 + Math.random() * 0.2})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
        
        // Draw smaller lines branching from the spikes
        const branchCount = 5;
        for (let j = 0; j < branchCount; j++) {
          const t = j / branchCount;
          const branchX = startX + (endX - startX) * t;
          const branchY = startY + (endY - startY) * t;
          
          const branchLength = radius * 0.1 * Math.random();
          const branchAngle = angle + Math.PI / 2 * (Math.random() - 0.5);
          
          const branchEndX = branchX + Math.cos(branchAngle) * branchLength;
          const branchEndY = branchY + Math.sin(branchAngle) * branchLength;
          
          ctx.beginPath();
          ctx.moveTo(branchX, branchY);
          ctx.lineTo(branchEndX, branchEndY);
          ctx.strokeStyle = `rgba(172, 255, 127, ${0.2 + Math.random() * 0.1})`;
          ctx.lineWidth = 0.2;
          ctx.stroke();
        }
      }
      
      ctx.restore();
      
      // Apply radial gradient
      ctx.fillStyle = createRadialGradient();
      ctx.globalCompositeOperation = 'source-atop';
      ctx.fillRect(0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));
      ctx.globalCompositeOperation = 'source-over';
      
      // Update animation
      rotation += 0.001;
      hue = (hue + 0.1) % 360;
    };
    
    const animate = () => {
      draw();
      requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', setCanvasSize);
    };
  }, []);

  return (
    <div className="relative w-full aspect-square mx-auto animate-fade-in">
      <div className="absolute inset-0 bg-neon-glow animate-pulse-glow"></div>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-defi-green/10 flex items-center justify-center animate-pulse-glow">
          <div className="w-8 h-8 rounded-full bg-defi-green/20 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-defi-green/60"></div>
          </div>
        </div>
      </div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-3 bg-defi-green/50"></div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-3 bg-defi-green/50"></div>
      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-px w-3 bg-defi-green/50"></div>
      <div className="absolute right-0 top-1/2 -translate-y-1/2 h-px w-3 bg-defi-green/50"></div>
    </div>
  );
}

import React, { useState, useRef, useCallback, useEffect } from 'react'
import html2canvas from 'html2canvas'
import './App.css'

const App = () => {
  const [photos, setPhotos] = useState([])
  const [showCamera, setShowCamera] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const fileInputRef = useRef(null)
  const collageRef = useRef(null)
  const videoRef = useRef(null)

  // Simulate loading time for the website
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 3000) // 3 seconds loading time

    return () => clearTimeout(timer)
  }, [])

  // Add photo to collage
  const addPhoto = useCallback((src) => {
    const newPhoto = {
      id: Date.now() + Math.random(),
      src
    }
    setPhotos(prev => [...prev, newPhoto])
  }, [])

  // Handle file upload
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files)
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => addPhoto(e.target.result)
        reader.readAsDataURL(file)
      }
    })
    event.target.value = ''
  }

  // Handle drag and drop
  const handleDrop = (event) => {
    event.preventDefault()
    const files = Array.from(event.dataTransfer.files)
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => addPhoto(e.target.result)
        reader.readAsDataURL(file)
      }
    })
  }

  const handleDragOver = (event) => {
    event.preventDefault()
  }

  // Camera functions
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      })
      videoRef.current.srcObject = stream
      setShowCamera(true)
    } catch (err) {
      alert('Camera access denied or not available')
    }
  }

  const capturePhoto = () => {
    const canvas = document.createElement('canvas')
    const video = videoRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0)
    const photoData = canvas.toDataURL('image/png')
    addPhoto(photoData)
    stopCamera()
  }

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }
    setShowCamera(false)
  }

  // Dynamic layout calculation
  const getCollageLayout = () => {
    const photoCount = photos.length
    if (photoCount === 0) return 'empty'
    
    // Always use auto layout based on photo count - always square grid
    if (photoCount === 1) return 'single'
    if (photoCount <= 4) return 'grid-2x2'
    if (photoCount <= 9) return 'grid-3x3'
    if (photoCount <= 16) return 'grid-4x4'
    if (photoCount <= 25) return 'grid-5x5'
    return 'grid-6x6' // For 26+ photos
  }

  const getGridSize = () => {
    const photoCount = photos.length
    if (photoCount === 1) return 1
    if (photoCount <= 4) return 2
    if (photoCount <= 9) return 3
    if (photoCount <= 16) return 4
    if (photoCount <= 25) return 5
    return 6
  }

  const removePhoto = (id) => {
    setPhotos(prev => prev.filter(photo => photo.id !== id))
  }

  // Download collage
  const downloadCollage = async () => {
    if (photos.length === 0) return
    
    const gridSize = getGridSize()
    const photoCount = photos.length
    
    // Calculate optimal container size based on grid
    const baseSize = 800
    const containerSize = baseSize
    const imageSize = Math.floor((containerSize - 40 - (gridSize - 1) * 10) / gridSize) // Subtract padding and gaps
    
    // Create a temporary container for clean download
    const downloadContainer = document.createElement('div')
    downloadContainer.style.cssText = `
      position: fixed;
      top: -9999px;
      left: -9999px;
      width: ${containerSize}px;
      height: ${containerSize}px;
      background: #ffffff;
      padding: 10px;
      display: grid;
      grid-template-columns: repeat(${gridSize}, 1fr);
      grid-template-rows: repeat(${gridSize}, 1fr);
      gap: 2px;
      font-family: Arial, sans-serif;
    `
    
    // Clone photos into download container - all square and same size
    photos.forEach((photo, index) => {
      // Only add photos that fit in the grid
      if (index < gridSize * gridSize) {
        const photoDiv = document.createElement('div')
        photoDiv.style.cssText = `
          width: ${imageSize}px;
          height: ${imageSize}px;
          overflow: hidden;
          background: #f0f0f0;
          border: 1px solid #ddd;
          position: relative;
        `
        
        const img = document.createElement('img')
        img.src = photo.src
        img.style.cssText = `
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        `
        
        photoDiv.appendChild(img)
        downloadContainer.appendChild(photoDiv)
      }
    })
    
    document.body.appendChild(downloadContainer)
    
    try {
      // Wait for images to load
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const canvas = await html2canvas(downloadContainer, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        width: containerSize,
        height: containerSize
      })
      
      const link = document.createElement('a')
      link.download = `ganesh-collage-${Date.now()}.png`
      link.href = canvas.toDataURL('image/png', 1.0)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Download failed:', error)
      alert('Download failed. Please try again.')
    } finally {
      // Remove temporary container
      document.body.removeChild(downloadContainer)
    }
  }

  // Enhanced Ganesh Loader with Beautiful Stars
  const AncientGaneshLoader = () => (
    <div className="ancient-loader">
      <div className="cosmic-background">
        <div className="stars"></div>
        <div className="stars2"></div>
        <div className="stars3"></div>
      </div>
      
      <div className="loader-container">
        <div className="ganesh-mandala">
          {/* Outer Ring */}
          <div className="mandala-ring outer-ring">
            <div className="sanskrit-text text-1">ॐ</div>
            <div className="sanskrit-text text-2">गं</div>
            <div className="sanskrit-text text-3">श्री</div>
            <div className="sanskrit-text text-4">गणपति</div>
          </div>

          {/* Inner Ring */}
          <div className="mandala-ring inner-ring">
            <div className="symbol symbol-1">🪔</div>
            <div className="symbol symbol-2">🌺</div>
            <div className="symbol symbol-3">🕉️</div>
            <div className="symbol symbol-4">🔱</div>
          </div>

          {/* Center */}
          <div className="center-ganesh">
            <div className="ganesh-icon">🐘</div>
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
        
        <div className="loader-text">
          <h2>श्री गणेश चतुर्थी</h2>
          <p>Creating Divine Memories...</p>
        </div>
      </div>
    </div>
  )

  if (isLoading) {
    return <AncientGaneshLoader />
  }

  return (
    <div className="app">
      {/* Animated Background */}
      <div className="animated-background">
        <div className="floating-element ganesh-om">ॐ</div>
        <div className="floating-element ganesh-om">गं</div>
        <div className="floating-element ganesh-om">श्री</div>
        <div className="floating-element ganesh-om">गणपति</div>
        <div className="floating-element ganesh-symbol">🪔</div>
        <div className="floating-element ganesh-symbol">🌺</div>
        <div className="floating-element ganesh-symbol">🕉️</div>
        <div className="floating-element ganesh-symbol">🎊</div>
        <div className="floating-element ganesh-symbol">✨</div>
        <div className="floating-element ganesh-om">बप्पा</div>
      </div>

      {/* Header */}
      <header className="header">
        <h1 className="title">Ganesh Chaturthi Collage Maker</h1>
        <p className="subtitle">Create beautiful memories for Ganpati Bappa</p>
      </header>

      {/* Controls */}
      <div className="controls">
        <button 
          className="control-btn camera-btn"
          onClick={startCamera}
        >
          📷 Camera
        </button>
        
        <button 
          className="control-btn upload-btn"
          onClick={() => fileInputRef.current?.click()}
        >
          📁 Upload
        </button>
        
        <button 
          className="control-btn download-btn"
          onClick={downloadCollage}
          disabled={photos.length === 0}
        >
          ⬇️ Download
        </button>
        
        <button 
          className="control-btn clear-btn"
          onClick={() => setPhotos([])}
          disabled={photos.length === 0}
        >
          🗑️ Clear
        </button>
      </div>

      {/* Grid Info Display */}
      {photos.length > 0 && (
        <div className="grid-info">
          <p>
            {photos.length} photo{photos.length > 1 ? 's' : ''} • {getGridSize()}×{getGridSize()} Grid
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />

      {/* Camera Modal */}
      {showCamera && (
        <div className="camera-modal">
          <div className="camera-container">
            <video ref={videoRef} autoPlay playsInline />
            <div className="camera-controls">
              <button onClick={capturePhoto} className="capture-btn">
                📸 Capture
              </button>
              <button onClick={stopCamera} className="close-btn">
                ❌ Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Collage Area */}
      <div 
        ref={collageRef}
        className={`collage-container ${getCollageLayout()}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {photos.length === 0 && (
          <div className="drop-zone">
            <div className="drop-text">
              <p>Drop images here or use camera/upload</p>
              <p>Create your Ganesh Chaturthi memories</p>
            </div>
          </div>
        )}
        
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className={`photo-slot slot-${index + 1}`}
          >
            <img 
              src={photo.src} 
              alt={`Collage item ${index + 1}`}
            />
            <button 
              className="remove-btn"
              onClick={() => removePhoto(photo.id)}
            >
              ❌
            </button>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="footer">
        <p>Ganpati Bappa Morya! 🙏</p>
        <div className="credits">
          <p>Created by <span className="creator-name">Ayush Mishra</span> & <span className="creator-name">Om Dhage</span></p>
        </div>
      </footer>
    </div>
  )
}

export default App

import React, { useState, useRef, useCallback } from 'react'
import Webcam from 'react-webcam'
import html2canvas from 'html2canvas'
import { saveAs } from 'file-saver'
import './App.css'

const App = () => {
  const [photos, setPhotos] = useState([])
  const [showCamera, setShowCamera] = useState(false)
  const webcamRef = useRef(null)
  const collageRef = useRef(null)

  // Capture photo from webcam with aspect ratio
  const capturePhoto = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot()
    if (imageSrc) {
      const img = new Image()
      img.onload = () => {
        const aspectRatio = img.width / img.height
        const orientation = aspectRatio > 1 ? 'landscape' : aspectRatio < 1 ? 'portrait' : 'square'
        
        setPhotos(prev => [...prev, {
          id: Date.now(),
          src: imageSrc,
          timestamp: new Date().toLocaleString(),
          aspectRatio: aspectRatio,
          orientation: orientation,
          width: img.width,
          height: img.height
        }])
        setShowCamera(false)
      }
      img.src = imageSrc
    }
  }, [webcamRef])

  // Handle file upload with aspect ratio calculation
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files)
    
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const aspectRatio = img.width / img.height
          const orientation = aspectRatio > 1 ? 'landscape' : aspectRatio < 1 ? 'portrait' : 'square'
          
          setPhotos(prev => [...prev, {
            id: Date.now() + Math.random(),
            src: e.target.result,
            timestamp: new Date().toLocaleString(),
            aspectRatio: aspectRatio,
            orientation: orientation,
            width: img.width,
            height: img.height
          }])
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(file)
    })
  }

  // Remove photo
  const removePhoto = (id) => {
    setPhotos(prev => prev.filter(photo => photo.id !== id))
  }

  // Download collage
  const downloadCollage = async () => {
    if (collageRef.current && photos.length > 0) {
      try {
        const canvas = await html2canvas(collageRef.current, {
          backgroundColor: '#fff',
          scale: 2,
          useCORS: true,
          allowTaint: true
        })
        canvas.toBlob((blob) => {
          saveAs(blob, `ganesh-collage-${Date.now()}.png`)
        })
      } catch (error) {
        console.error('Error generating collage:', error)
        alert('Error generating collage. Please try again.')
      }
    }
  }

  // Clear all photos
  const clearAllPhotos = () => {
    setPhotos([])
  }

  // Get layout configuration based on photo count - single collage that gets more complex
  const getLayoutConfig = (photoCount) => {
    if (photoCount <= 1) return { rows: 1, cols: 1, type: 'single' }
    if (photoCount <= 4) return { rows: 2, cols: 2, type: 'grid' }
    if (photoCount <= 6) return { rows: 2, cols: 3, type: 'grid' }
    if (photoCount <= 9) return { rows: 3, cols: 3, type: 'complex' }
    if (photoCount <= 12) return { rows: 3, cols: 4, type: 'complex' }
    if (photoCount <= 16) return { rows: 4, cols: 4, type: 'complex' }
    if (photoCount <= 20) return { rows: 4, cols: 5, type: 'ultra' }
    if (photoCount <= 25) return { rows: 5, cols: 5, type: 'ultra' }
    if (photoCount <= 30) return { rows: 5, cols: 6, type: 'mega' }
    if (photoCount <= 36) return { rows: 6, cols: 6, type: 'mega' }
    if (photoCount <= 42) return { rows: 6, cols: 7, type: 'extreme' }
    if (photoCount <= 49) return { rows: 7, cols: 7, type: 'extreme' }
    if (photoCount <= 56) return { rows: 7, cols: 8, type: 'insane' }
    if (photoCount <= 64) return { rows: 8, cols: 8, type: 'insane' }
    if (photoCount <= 81) return { rows: 9, cols: 9, type: 'infinite' }
    if (photoCount <= 100) return { rows: 10, cols: 10, type: 'infinite' }
    
    // For 100+ photos, dynamically calculate grid size
    const gridSize = Math.ceil(Math.sqrt(photoCount))
    return { 
      rows: gridSize, 
      cols: gridSize, 
      type: 'infinite'
    }
  }

  const layoutConfig = getLayoutConfig(photos.length)

  // Get grid position for smart placement - all photos in single collage
  const getGridPosition = (index, config, orientation) => {
    const { rows, cols, type } = config
    
    if (type === 'single') {
      return { row: '1', col: '1' }
    }
    
    // For all layouts, use systematic grid filling
    const row = Math.floor(index / cols) + 1
    const col = (index % cols) + 1
    return { row: `${row}`, col: `${col}` }
  }

  const layoutStyles = {
    grid: 'collage-grid',
    mosaic: 'collage-mosaic',
    frame: 'collage-frame'
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1 className="title">🕉️ Ganesh Chaturthi Live Collage Maker</h1>
          <p className="subtitle">Create beautiful memories of Lord Ganesha's celebration</p>
        </div>
      </header>

      {/* Controls */}
      <div className="controls">
        <div className="control-buttons">
          <button 
            className="btn btn-primary"
            onClick={() => setShowCamera(true)}
          >
            📷 Take Photo
          </button>
          
          <label className="btn btn-secondary">
            📁 Upload Photos
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </label>

          {photos.length > 0 && (
            <>
              <button 
                className="btn btn-success"
                onClick={downloadCollage}
              >
                💾 Download Collage
              </button>
              
              <button 
                className="btn btn-danger"
                onClick={clearAllPhotos}
              >
                🗑️ Clear All
              </button>
            </>
          )}
        </div>
        
        <div className="photo-count">
          Photos: {photos.length} | Grid: {layoutConfig.rows}×{layoutConfig.cols}
          <span className="complexity-info">
            {photos.length > 1 && `(${(600 / layoutConfig.rows).toFixed(0)}px per photo)`}
          </span>
        </div>
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <div className="camera-modal">
          <div className="camera-container">
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width={400}
              height={300}
              className="webcam"
            />
            <div className="camera-controls">
              <button 
                className="btn btn-primary"
                onClick={capturePhoto}
              >
                📸 Capture
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => setShowCamera(false)}
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Collage Area */}
      <div className="main-content">
        {photos.length === 0 ? (
          <div className="empty-state">
            <div className="ganesha-icon">🐘</div>
            <h2>Welcome to Ganesh Chaturthi Collage Maker!</h2>
            <p>Start by taking a photo or uploading images to create your beautiful collage</p>
            <div className="ganesh-decoration">
              <span>🕉️</span>
              <span>🌺</span>
              <span>🪔</span>
              <span>🌺</span>
              <span>🕉️</span>
            </div>
          </div>
        ) : (
          <div 
            ref={collageRef}
            className="collage-container"
          >
            <div className="collage-header">
              <h2>🕉️ Ganpati Bappa Morya 🕉️</h2>
              <div className="decorative-border"></div>
            </div>
            
            <div 
              className={`photos-grid layout-${layoutConfig.type}`}
              style={{
                '--grid-rows': layoutConfig.rows,
                '--grid-cols': layoutConfig.cols,
                position: 'relative'
              }}
            >
              {photos.map((photo, index) => {
                const gridPosition = getGridPosition(index, layoutConfig, photo.orientation)
                return (
                  <div 
                    key={photo.id} 
                    className={`photo-item ${photo.orientation}`}
                    style={{
                      gridRow: gridPosition.row,
                      gridColumn: gridPosition.col
                    }}
                  >
                    <img 
                      src={photo.src} 
                      alt={`Photo ${index + 1}`}
                      className="photo-image"
                      style={{
                        objectFit: 'cover',
                        objectPosition: 'center'
                      }}
                    />
                    <button 
                      className="remove-btn"
                      onClick={() => removePhoto(photo.id)}
                      title="Remove photo"
                    >
                      ❌
                    </button>
                    <div className="photo-timestamp">
                      #{index + 1}
                    </div>
                  </div>
                )
              })}
            </div>
            
            <div className="collage-footer">
              <div className="decorative-border"></div>
              <p>✨ Ganesh Chaturthi {new Date().getFullYear()} ✨</p>
              <div className="footer-decoration">
                <span>🌺</span>
                <span>🪔</span>
                <span>🕉️</span>
                <span>🪔</span>
                <span>🌺</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="footer">
        <p>Created with ❤️ for Ganesh Chaturthi celebrations</p>
        <div className="footer-icons">
          <span>🐘</span>
          <span>🕉️</span>
          <span>🌺</span>
          <span>🪔</span>
        </div>
      </footer>
    </div>
  )
}

export default App

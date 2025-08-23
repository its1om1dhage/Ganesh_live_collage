import React, { useState, useRef, useCallback, useEffect } from 'react'
import Webcam from 'react-webcam'
import html2canvas from 'html2canvas'
import { saveAs } from 'file-saver'
import './App.css'

const App = () => {
  const [photos, setPhotos] = useState([])
  const [showCamera, setShowCamera] = useState(false)
  const [screenSize, setScreenSize] = useState('desktop')
  const webcamRef = useRef(null)
  const collageRef = useRef(null)
  const mosaicRef = useRef(null)

  // Detect screen size for responsive grid
  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth
      if (width < 480) {
        setScreenSize('mobile')
      } else if (width < 768) {
        setScreenSize('tablet')
      } else if (width < 1024) {
        setScreenSize('laptop')
      } else {
        setScreenSize('desktop')
      }
    }

    updateScreenSize()
    window.addEventListener('resize', updateScreenSize)
    return () => window.removeEventListener('resize', updateScreenSize)
  }, [])

  // Get grid size based on screen size and photo count
  const getResponsiveGridSize = (photoCount, screenSize) => {
    const baseSizes = {
      mobile: Math.min(3, Math.max(2, Math.ceil(Math.sqrt(photoCount)))),
      tablet: Math.min(4, Math.max(3, Math.ceil(Math.sqrt(photoCount)))),
      laptop: Math.min(5, Math.max(4, Math.ceil(Math.sqrt(photoCount * 1.2)))),
      desktop: Math.min(6, Math.max(4, Math.ceil(Math.sqrt(photoCount * 1.5))))
    }
    return baseSizes[screenSize] || 4
  }

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
    if (mosaicRef.current && photos.length > 0) {
      try {
        const canvas = await html2canvas(mosaicRef.current, {
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

  // Dynamic Mosaic Layout Generator - Creates varied, artistic layouts
  const generateMosaicLayout = (photoCount) => {
    const layouts = []
    const gridSize = getResponsiveGridSize(photoCount, screenSize)
    
    // Simpler layouts for mobile
    if (screenSize === 'mobile') {
      if (photoCount === 1) {
        return [{ size: 'large', row: 1, col: 1, rowSpan: 2, colSpan: 2 }]
      }
      if (photoCount === 2) {
        return [
          { size: 'medium', row: 1, col: 1, rowSpan: 1, colSpan: 2 },
          { size: 'medium', row: 2, col: 1, rowSpan: 1, colSpan: 2 }
        ]
      }
      if (photoCount === 3) {
        return [
          { size: 'medium', row: 1, col: 1, rowSpan: 1, colSpan: 2 },
          { size: 'small', row: 2, col: 1, rowSpan: 1, colSpan: 1 },
          { size: 'small', row: 2, col: 2, rowSpan: 1, colSpan: 1 }
        ]
      }
    }
    
    if (photoCount === 1) {
      const span = screenSize === 'mobile' ? 2 : 4
      return [{ size: 'large', row: 1, col: 1, rowSpan: span, colSpan: span }]
    }
    
    if (photoCount === 2) {
      const span = Math.floor(gridSize / 2)
      return [
        { size: 'large', row: 1, col: 1, rowSpan: gridSize, colSpan: span },
        { size: 'large', row: 1, col: span + 1, rowSpan: gridSize, colSpan: span }
      ]
    }
    
    if (photoCount === 3) {
      const largePan = Math.floor(gridSize * 0.6)
      const mediumSpan = gridSize - largePan
      return [
        { size: 'large', row: 1, col: 1, rowSpan: largePan, colSpan: largePan },
        { size: 'medium', row: 1, col: largePan + 1, rowSpan: Math.floor(mediumSpan/2) || 1, colSpan: mediumSpan },
        { size: 'medium', row: Math.floor(mediumSpan/2) + 2, col: largePan + 1, rowSpan: Math.ceil(mediumSpan/2), colSpan: mediumSpan }
      ]
    }
    
    // For more complex layouts, use dynamic algorithm but adapt to screen size
    const patterns = screenSize === 'mobile' ? [
      { size: 'medium', rowSpan: 1, colSpan: 2 },
      { size: 'small', rowSpan: 1, colSpan: 1 },
      { size: 'wide', rowSpan: 1, colSpan: 3 }
    ] : [
      { size: 'large', rowSpan: 2, colSpan: 2 },
      { size: 'wide', rowSpan: 1, colSpan: 3 },
      { size: 'tall', rowSpan: 3, colSpan: 1 },
      { size: 'medium', rowSpan: 1, colSpan: 2 },
      { size: 'small', rowSpan: 1, colSpan: 1 }
    ]
    
    // Create a dynamic grid layout for remaining photos
    let currentRow = 1
    let currentCol = 1
    const occupiedCells = new Set()
    
    for (let i = 0; i < photoCount; i++) {
      const pattern = patterns[i % patterns.length]
      
      // Find next available position
      while (occupiedCells.has(`${currentRow}-${currentCol}`)) {
        currentCol++
        if (currentCol > gridSize) {
          currentCol = 1
          currentRow++
        }
      }
      
      // Check if pattern fits
      let canFit = true
      const endRow = currentRow + pattern.rowSpan - 1
      const endCol = currentCol + pattern.colSpan - 1
      
      if (endRow > gridSize || endCol > gridSize) {
        // Use small size if doesn't fit
        layouts.push({
          size: 'small',
          row: currentRow,
          col: currentCol,
          rowSpan: 1,
          colSpan: 1
        })
        occupiedCells.add(`${currentRow}-${currentCol}`)
      } else {
        // Check if all cells are free
        for (let r = currentRow; r <= endRow; r++) {
          for (let c = currentCol; c <= endCol; c++) {
            if (occupiedCells.has(`${r}-${c}`)) {
              canFit = false
              break
            }
          }
          if (!canFit) break
        }
        
        if (canFit) {
          layouts.push({
            size: pattern.size,
            row: currentRow,
            col: currentCol,
            rowSpan: pattern.rowSpan,
            colSpan: pattern.colSpan
          })
          
          // Mark cells as occupied
          for (let r = currentRow; r <= endRow; r++) {
            for (let c = currentCol; c <= endCol; c++) {
              occupiedCells.add(`${r}-${c}`)
            }
          }
        } else {
          // Use small size if can't fit
          layouts.push({
            size: 'small',
            row: currentRow,
            col: currentCol,
            rowSpan: 1,
            colSpan: 1
          })
          occupiedCells.add(`${currentRow}-${currentCol}`)
        }
      }
      
      currentCol++
      if (currentCol > gridSize) {
        currentCol = 1
        currentRow++
      }
    }
    
    return layouts
  }

  const mosaicLayout = generateMosaicLayout(photos.length)
  const gridSize = getResponsiveGridSize(photos.length, screenSize)  // Get grid position for dynamic mosaic layout
  const getGridPosition = (index, layout) => {
    return {
      row: `${layout.row} / ${layout.row + layout.rowSpan}`,
      col: `${layout.col} / ${layout.col + layout.colSpan}`
    }
  }

  const layoutStyles = {
    grid: 'collage-grid',
    mosaic: 'collage-mosaic',
    frame: 'collage-frame'
  }

  return (
    <div className="app">
      {/* Enhanced Header */}
      <header className="header">
        <div className="floating-elements">
          <div className="floating-icon">🕉️</div>
          <div className="floating-icon">🌺</div>
          <div className="floating-icon">🪔</div>
        </div>
        <div className="header-content">
          <h1 className="title animated-title">🕉️ Ganesh Chaturthi Live Collage Maker</h1>
          <p className="subtitle">Create beautiful memories of Lord Ganesha's celebration</p>
          <div className="header-credits">
            <span className="sparkle">✨</span>
            <p className="credits-header">🚀 Project made by <strong>Ayush Mishra</strong> and <strong>Om Dhage</strong></p>
            <span className="sparkle">✨</span>
          </div>
        </div>
      </header>

      {/* Technical Tips Section */}
      <div className="tips-section">
        <div className="tips-content">
          <div className="tips-header">
            <span className="tips-icon">›</span>
            <h3>Optimization Guidelines</h3>
            <span className="tips-icon">‹</span>
          </div>
          <div className="tips-list">
            <div className="tip tip-primary">
              <span className="tip-icon">▣</span>
              <div className="tip-content">
                <strong>Square Aspect Ratio</strong>
                <span>1:1 ratio images optimize mosaic tessellation algorithms</span>
              </div>
            </div>
            <div className="tip tip-secondary">
              <span className="tip-icon">⟹</span>
              <div className="tip-content">
                <strong>Sequential Processing</strong>
                <span>Incremental photo addition enables dynamic layout recalculation</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Controls */}
      <div className="controls">
        <div className="controls-header">
          <h3>› Image Processing Interface</h3>
        </div>
        <div className="control-buttons">
          <button 
            className="btn btn-primary"
            onClick={() => setShowCamera(true)}
          >
            <span className="btn-icon">📷</span>
            <span className="btn-text">Camera Capture</span>
          </button>
          
          <label className="btn btn-secondary">
            <span className="btn-icon">📁</span>
            <span className="btn-text">File Upload</span>
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
                <span className="btn-icon">💾</span>
                <span className="btn-text">Export Mosaic</span>
              </button>
              
              <button 
                className="btn btn-danger"
                onClick={clearAllPhotos}
              >
                <span className="btn-icon">🗑️</span>
                <span className="btn-text">Reset Buffer</span>
              </button>
            </>
          )}
        </div>
        
        <div className="photo-count">
          <span className="count-label">› Buffer: {photos.length} images</span>
          <span className="layout-type">› Algorithm: Dynamic Mosaic</span>
          {photos.length > 1 && (
            <span className="complexity-info">› Status: Multi-dimensional layout active</span>
          )}
        </div>
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <div className="camera-modal">
          <div className="camera-container">
            <h3>📸 Camera Capture Interface</h3>
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width={screenSize === 'mobile' ? 280 : screenSize === 'tablet' ? 350 : 400}
              height={screenSize === 'mobile' ? 210 : screenSize === 'tablet' ? 262 : 300}
              className="camera-video"
            />
            <div className="camera-controls">
              <button 
                className="btn btn-primary"
                onClick={capturePhoto}
              >
                <span className="btn-icon">📸</span>
                <span className="btn-text">Capture</span>
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => setShowCamera(false)}
              >
                <span className="btn-icon">❌</span>
                <span className="btn-text">Cancel</span>
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
            <p>Start by taking a photo or uploading images to create your perfect-fit collage</p>
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
              ref={mosaicRef}
              className="photos-mosaic"
              style={{
                '--grid-size': gridSize,
                position: 'relative'
              }}
            >
              {photos.map((photo, index) => {
                const layout = mosaicLayout[index]
                if (!layout) return null
                
                const gridPosition = getGridPosition(index, layout)
                return (
                  <div 
                    key={photo.id} 
                    className={`photo-item ${photo.orientation} size-${layout.size}`}
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
                    <div className="size-indicator">
                      {layout.size}
                    </div>
                  </div>
                )
              })}
            </div>
            
            <div className="collage-footer">
              <div className="decorative-border"></div>
              <p>✨ Ganesh Chaturthi {new Date().getFullYear()} ✨</p>
              <p className="perfect-fit-indicator">Dynamic Mosaic: {photos.length} photos in artistic layout!</p>
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

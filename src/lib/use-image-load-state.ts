import { useState } from "react"

function useImageLoadState() {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  return {
    loaded,
    error,
    onLoad: () => setLoaded(true),
    onError: () => setError(true),
  }
}

export { useImageLoadState }

import { useState, useEffect } from 'react'

export function useExample(initialValue: string) {
  const [value, setValue] = useState(initialValue)
  
  useEffect(() => {
    // Example effect
    console.log('Value changed:', value)
  }, [value])

  return { value, setValue }
}

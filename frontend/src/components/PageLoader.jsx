import { LoaderIcon } from 'lucide-react'
import React from 'react'
import useAuthUser from '../hooks/useAuthUser'
import { useThemestore } from '../store/useThemeStore'

const PageLoader = () => {
  const {theme} = useThemestore();
  const {isLoading, authUser} = useAuthUser()
  return (
    <div className="min-h-screen flex items-center justify-center" data-theme={theme}>
      <LoaderIcon className="animate-spin size-10 text-primary" />
    </div>
  )
}

export default PageLoader
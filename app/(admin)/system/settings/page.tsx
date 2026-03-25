import React from 'react'
import { Suspense } from 'react'
import SettingsContent from "./content"

const page = () => {
  return (
    <Suspense fallback={<div>Loading settings...</div>}>
        <SettingsContent />
    </Suspense>
  )
}

export default page
import React from 'react'
import {assets} from '../assets/assets'

const Footer = () => {
  return (
    <div className='flex items-center justify-between gap-4 py-3 mt-20'>
      <img src={assets.logo} alt="Logo" width={150} />
      <p className='flex-1 border-l border-gray-400 pl-4 text-gray-500 text-sm max-sm:hidden'>Copyright© 2023 Text to Image Generator. All rights reserved.</p>

      <div className='flex gap-2.5'>
        <img src={assets.facebook_icon} alt="Facebook" width={35} className='hover:scale-110 transition-transform duration-200' />
        <img src={assets.twitter_icon} alt="Twitter" width={35} className='hover:scale-110 transition-transform duration-200' />
        <img src={assets.instagram_icon} alt="Instagram" width={35} className='hover:scale-110 transition-transform duration-200' />
      </div>
    </div>
  )
}

export default Footer

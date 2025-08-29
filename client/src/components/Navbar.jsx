import React, { useContext } from 'react'
import {assets} from '../assets/assets'
import { Link, useNavigate } from 'react-router-dom'
import {AppContext} from '../context/AppContext'

const Navbar = () => {

  const { user, setShowLogin, logout, credit } = useContext(AppContext);

  const navigate = useNavigate();

  return (
    <div className='flex items-center justify-between py-4'> 
      <Link to="/"> 
        <img src={assets.logo} alt="Logo" className="w-28 sm-32 lg:w-40" />
      </Link>

      <div>
        {user ? 
          <div className='flex items-center gap-2 sm:gap-3'>
            <button onClick={() => navigate('/buy')} className='flex items-center gap-2 bg-blue-100 px-4 sm:px-6 py-1.5 rounded-full hover:scale-105 transition-all duration-700'>
              <img className='w-5' src={assets.credit_star} alt="Credit Star" />
              <p className='text-xs sm:text-sm font-medium text-gray-600'>Credits left: {credit}</p>
            </button>
            <p className='text-gray-600 max-sm:hidden pl-4'>Hi, {user.name}</p>
            <div className='relative group'>
              <img src={assets.profile_icon} alt="User" className='w-10 drop-shadow' />
              <div className='absolute hidden group-hover:block rounded pt-12 z-10 right-0 top-0 text-black'>
                <ul className='list-none m-0 p-2 bg-white rounded-md text-sm text-center border-teal-100 border'>
                  <li className='py-0.5 px-2 cursor-pointer' onClick={logout}>Logout</li>
                </ul>
              </div>
            </div>
          </div>
        :
          <div className='flex items-center gap-2 sm:gap-5'>
            <p onClick={() => navigate('/buy')} className='cursor-pointer'>Pricing</p>
            <button onClick={() => setShowLogin(true)} className='bg-zinc-800 text-white px-7 py-2 sm:px-10 text-sm rounded-full'>Login</button>
          </div>
        }
      </div>
    </div>
  )
}

export default Navbar

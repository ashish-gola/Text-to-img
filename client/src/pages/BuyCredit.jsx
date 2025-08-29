import React from 'react'
import { assets, plans } from '../assets/assets'
import { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import axios from 'axios'

const BuyCredit = () => {

const { user, setShowLogin, loadCreditsData, loading } = useContext(AppContext);
const navigate = useNavigate();

const initPay = (order) => {
  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount: order.amount,
    currency: order.currency,
    name: 'Credits Payment',
    description: 'Credits Payment',
    order_id: order.id,
    receipt: order.receipt,
    handler: async (response) => {
      try {
        const { data } = await axios.post('/api/user/verify-razor', response);
        if (data.success) {
          loadCreditsData();
          navigate('/');
          toast.success('Credits Added Successfully');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        const errorMessage = error.response?.data?.message || 'Payment verification failed';
        toast.error(errorMessage);
      }
    },
    prefill: {
      name: user?.name || '',
      email: user?.email || ''
    }
  };
  const rzp = new window.Razorpay(options);
  rzp.open();
}

const paymentRazorpay = async (planId) => {
  try {
    if (!user) {
      setShowLogin(true);
      return;
    }
    
    const { data } = await axios.post('/api/user/pay-razor', { planId });
    
    if (data.success) {
      // Check if it's demo mode
      if (data.demoMode) {
        toast.success(`${data.message} (Demo Mode)`);
        // Refresh user credits
        if (loadCreditsData) {
          loadCreditsData();
        }
        // Navigate back to result page after a short delay
        setTimeout(() => {
          navigate('/result');
        }, 2000);
      } else {
        initPay(data.order);
      }
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    console.error('Payment error:', error);
    const errorMessage = error.response?.data?.message || 'Payment failed';
    toast.error(errorMessage);
  }
}

  return (
    <motion.div initial={{ opacity: 0.2, y: 100 }} transition={{ duration: 1 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
    className='min-h-[80vh] text-center pt-14 mb-10'>
      <button className='border border-gray-400 px-10 py-2 rounded-full mb-6'>Our Plans</button>
      <h1 className='text-center text-3xl font-medium mb-6 sm:mb-10'>Choose the Plan</h1>

      <div className='flex flex-wrap justify-center gap-6 text-left'> 
        {plans.map((item, index) => (
          <div key={index} className='bg-white drop-shadow-sm rounded-lg py-12 px-8 text-gray-600 hover:scale-105 transition-all duration-500'>
            <img width={40} src={assets.logo_icon} alt="" />
            <p className='mt-3 mb-1 font-semibold'>{item.id}</p>
            <p className='text-sm'>{item.desc}</p>
            <p className='mt-6'> 
              <span className='text-3xl font-medium'>${item.price} </span>
              / {item.credits} credits
            </p>
            <button 
              onClick={() => paymentRazorpay(item.id)} 
              disabled={loading}
              className={`w-full mt-8 text-sm rounded-md py-2.5 min-w-52 transition-colors ${
                loading 
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              {loading ? 'Processing...' : (user ? 'Purchase' : 'Get Started')}
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

export default BuyCredit

import React from 'react'
import { assets } from '../assets/assets'
import { useState, useContext } from 'react'
import { motion } from 'motion/react'
import { AppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'

const Result = () => {

 const [image, setImage] = useState(assets.sample_img_1);
 const [isImageLoading, setIsImageLoading] = useState(false);
 const [Loading, setLoading] = useState(false);
 const [input, setInput] = useState('');

 const { updateCredits, user, loading } = useContext(AppContext);
 const navigate = useNavigate();

 const onSubmitHandler = async (e) => {
    e.preventDefault();
    
    // If user has no credits, redirect to buy page
    if (user && user.creditBalance <= 0) {
      toast.info('Redirecting to buy credits page...');
      navigate('/buy');
      return;
    }
    
    if (!input.trim()) {
      toast.error('Please enter a description for the image');
      return;
    }

    setLoading(true);
    setImage(null);

    try {
      const { data } = await axios.post('/api/image/generate-image', {
        prompt: input.trim()
      });

      if (data.success) {
        setIsImageLoading(true);
        setImage(data.resultImage);
        updateCredits(data.creditBalance);
        toast.success('Image generated successfully!');
      } else {
        toast.error(data.message);
        if (data.creditBalance !== undefined) {
          updateCredits(data.creditBalance);
        }
        
        // Check if the error is due to insufficient credits
        if (data.message && data.message.toLowerCase().includes('insufficient')) {
          setTimeout(() => {
            navigate('/buy');
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Image generation error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to generate image';
      toast.error(errorMessage);
      
      // Check if the error response indicates insufficient credits
      if (error.response?.status === 403 || 
          (error.response?.data?.message && error.response.data.message.toLowerCase().includes('insufficient'))) {
        toast.info('Redirecting to buy credits page...');
        setTimeout(() => {
          navigate('/buy');
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
 }

 const handleGenerateAnother = () => {
   setIsImageLoading(false);
   setImage(assets.sample_img_1);
   setInput('');
 }

  return (
    <motion.form 
      initial={{ opacity: 0.2, y: 100 }} 
      transition={{ duration: 1 }} 
      whileInView={{ opacity: 1, y: 0 }} 
      viewport={{ once: true }}
      onSubmit={onSubmitHandler}
      className='flex flex-col min-h-[90vh] justify-center items-center'
    > 
      {/* Image Display Container */}
      <div className='w-full max-w-lg mx-auto mb-8'>
        <div className='relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 shadow-xl border border-gray-200'>
          {/* Header */}
          <div className='text-center mb-6'>
            <h2 className='text-2xl font-bold text-gray-800 mb-2'>
              {Loading ? 'Creating Your Image...' : isImageLoading ? 'Generated Result' : 'AI Image Generator'}
            </h2>
            <p className='text-gray-600 text-sm'>
              {Loading ? 'Please wait while we generate your image' : 'Your AI-generated artwork'}
            </p>
          </div>

          {/* Image Area */}
          <div className='relative flex justify-center'>
            {Loading && !image ? (
              <div className="w-full max-w-sm h-80 bg-white rounded-xl shadow-inner flex items-center justify-center border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <div className="relative mb-4">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
                  </div>
                  <p className="text-gray-700 font-medium text-lg mb-2">Generating image...</p>
                  <p className="text-gray-500 text-sm">This may take a few moments</p>
                </div>
              </div>
            ) : (
              image && (
                <div className="relative group">
                  <img 
                    src={image} 
                    alt="Generated Result" 
                    className='max-w-sm w-full rounded-xl shadow-lg transition-transform duration-300 hover:scale-105 border border-gray-200' 
                  />
                  {/* Image border glow effect */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              )
            )}
            
            {/* Progress Bar */}
            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-full overflow-hidden ${Loading ? 'opacity-100' : 'opacity-0'}`}>
              <div className={`h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-[10s] ${Loading ? 'w-full' : 'w-0'}`}></div>
            </div>
          </div>

          {/* Status Text */}
          {Loading && (
            <div className='text-center mt-4'>
              <p className='text-gray-600 text-sm'>Generating your unique image...</p>
              <div className='flex justify-center items-center mt-2 space-x-1'>
                <div className='w-2 h-2 bg-blue-500 rounded-full animate-bounce'></div>
                <div className='w-2 h-2 bg-blue-500 rounded-full animate-bounce' style={{animationDelay: '0.1s'}}></div>
                <div className='w-2 h-2 bg-blue-500 rounded-full animate-bounce' style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          )}
        </div>
      </div>
    
      {/* Credits Status
      {user && (
        <div className='text-center mb-4'>
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
            user.creditBalance <= 0 
              ? 'bg-red-100 text-red-800 border border-red-200' 
              : user.creditBalance <= 2 
              ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
              : 'bg-green-100 text-green-800 border border-green-200'
          }`}>
            <span className='mr-2'>💳</span>
            Credits: {user.creditBalance}
          </div>
          {user.creditBalance <= 2 && user.creditBalance > 0 && (
            <p className='text-sm text-yellow-600 mt-2'>
              Low credits! Consider buying more to continue generating images.
            </p>
          )}
        </div>
      )} */}
    
      {!isImageLoading && 
        <div className='flex w-full max-w-xl bg-neutral-500 text-white text-sm p-0.5 mt-10 rounded-full'>
          <input 
            onChange={(e) => setInput(e.target.value)} 
            value={input}
            type="text" 
            placeholder="Describe what you want to generate" 
            className='flex-1 bg-transparent outline-none ml-8 max-sm:w-20 placeholder-white' 
            required 
            disabled={Loading || loading}
          />
          <button 
            type='submit' 
            disabled={Loading || loading || (!input.trim() && user && user.creditBalance > 0)}
            className={`px-10 sm:px-16 py-3 rounded-full transition-colors ${
              Loading || loading || (!input.trim() && user && user.creditBalance > 0)
                ? 'bg-gray-600 cursor-not-allowed' 
                : user && user.creditBalance <= 0
                ? 'bg-zinc-900 hover:bg-zinc-800'
                : 'bg-zinc-900 hover:bg-zinc-800'
            }`}
            title={user && user.creditBalance <= 0 ? 'Click to buy credits' : ''}
          >
            {Loading ? 'Generating...' : 
             user && user.creditBalance <= 0 ? 'Buy Credits' : 'Generate'}
          </button>
        </div>
      }

      {isImageLoading &&
        <div className='flex gap-2 flex-wrap justify-center text-white text-sm p-0.5 mt-10 rounded-full'>
          <button 
            type="button"
            onClick={handleGenerateAnother}
            className='bg-transparent border border-zinc-900 text-black px-8 py-3 rounded-full cursor-pointer hover:bg-gray-100 transition-colors'
          >
            Generate Another
          </button>
          <a 
            href={image} 
            download={`generated-image-${Date.now()}.png`}
            className='bg-zinc-900 px-10 py-3 rounded-full cursor-pointer hover:bg-zinc-800 transition-colors text-center'
          >
            Download
          </a>
        </div>
      }
    </motion.form>
  )
}

export default Result
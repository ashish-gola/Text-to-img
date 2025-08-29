import React from 'react'
import { assets, testimonialsData } from '../assets/assets'
import { motion } from 'motion/react'

const Testimonials = () => {
  return (
  <motion.div initial={{ opacity: 0.2, y: 100 }} transition={{ duration: 1 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} 
  className='flex flex-col items-center justify-center my-20 p-6 py-12'>
      <h1 className='text-3xl sm:text-4xl font-semibold mb-2'>Customer testimonials</h1>
      <p className='text-gray-500 mb-12'>What Our Users Are Saying</p>

      <div className='flex flex-wrap gap-8'>
        {testimonialsData.map((testimonial, index) => (
            <div key={index} className='bg-white/20 rounded-lg shadow-md order w-70 m-auto cursor-pointer hover:scale-[1.02] transition-all'>
                <div className='flex flex-col items-center'>
                    <img src={testimonial.image} alt="" className='w-14 rounded-full'/>
                    <h2 className='text-xl font-semibold mt-3'>{testimonial.name}</h2>
                    <p className='text-gray-500 mb-4'> {testimonial.role}</p>
                    <div className='flex'>
                        {Array(testimonial.stars).fill('').map((item, index) => (
                            <img key={index} src={assets.rating_star} alt=""/>
                        ))}
                    </div>
                    <p className='text-gray-600 text-center text-sm p-8'>{testimonial.text}</p>
                </div>
            </div>
        ))}

      </div>
  </motion.div>
  )
}

export default Testimonials

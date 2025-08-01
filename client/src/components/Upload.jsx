
import { useContext } from "react";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";


const Upload = () => {
       const {removeBg}=useContext(AppContext);
    return (
        <div className="pb-16">
            {/* title */}

            <h1 className="text-center text-2xl md:text-3xl lg:text-4xl mt-4 font-semibold bg-gradient-to-r from-gray-900 to-gray-400 bg-clip-text text-transparent py-6 md:py-16  ">See teh magic,try now</h1>
            <div className="text-center mb-24">
                <input onChange={e=>removeBg(e.target.files[0])} type='file' accept="image/*" id='upload2' hidden />
                <label className="inline-flex gap-3 px-8 py-3.5 rounded-full cursor-pointer bg-gradient-to-r from-violet-600 to-fuchsia-300 m-auto hover:scale-105 transition-all duration-700" htmlFor="upload2">
                    <img width={20} src={assets.upload_btn_icon} alt="" />
                    <p className="text-white text-sm ">Upload your image</p>
                </label>
            </div>
        </div>
    )
}
export default Upload;
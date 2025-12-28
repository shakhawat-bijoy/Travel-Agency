import Button from "../common/Buttton";

const AttractionsMap = () => {
  return (
    <>
      <div className="max-w-[1230px] mx-auto md:mt-20 my-8 px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col gap-4">
            <h1 className="text-[#000] text-xl sm:text-2xl md:text-[32px] font-semibold font-montserrat">
              Let's go places together
            </h1>
            <p className="text-sm md:text-base font-normal font-montserrat">
              Discover the latest offers and news and start planning your next trip with us.
            </p>
          </div>
          <div className="flex-shrink-0">
            <Button
              text="See All"
              className="px-4 py-2 text-black rounded-md border border-[#8DD3BB] text-sm font-medium whitespace-nowrap"
            />
          </div>
        </div>
      </div>

      <div className="w-full h-[300px] sm:h-[400px] md:h-[500px] mt-6 md:mt-10">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1890.6370501119384!2d2.2937355631332186!3d48.85813466144875!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66e2964e34e2d%3A0x8ddca9ee380ef7e0!2sEiffel%20Tower!5e1!3m2!1sen!2sus!4v1766928871201!5m2!1sen!2sus"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="rounded-xl shadow-lg"
          title="Eiffel Tower 3D Map"
        ></iframe>
      </div>
    </>
  );
};

export default AttractionsMap;
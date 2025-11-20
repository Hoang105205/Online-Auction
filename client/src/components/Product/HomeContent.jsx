import { Carousel, Card } from "flowbite-react";

const HomeContent = () => {
  const temp = ["1", "2", "3", "4", "5"];
  return (
    <div className="h-60 sm:h-64 xl:h-80 2xl:h-[450px]">
      <Carousel pauseOnHover>
        {temp.map((t, i) => (
          <div key={i} className="flex items-center justify-center bg-gray-200">
            <Card
              className="max-w-[300px] shadow-none"
              imgAlt="Apple Watch Series 7 in colors pink, silver, and black"
              imgSrc="/img/image1.jpg"
            >
              <a href="#">
                <h5 className="text-sm font-semibold tracking-tight text-gray-900 dark:text-white">
                  Apple Watch Series 7 GPS, Aluminium Case, Starlight Sport
                </h5>
              </a>
              <div className="flex items-center">
                <span className="ml-3 mr-2 rounded bg-cyan-100 px-2.5 text-xs font-semibold text-cyan-800 dark:bg-cyan-200 dark:text-cyan-800">
                  5.0
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  $599
                </span>
              </div>
            </Card>
          </div>
        ))}
      </Carousel>
      <div className="mt-[100px] flex overflow-x-auto items-center">
        {temp.map((t, i) => (
          <Card
            key={i}
            className="max-w-[300px] shadow-none"
            imgAlt="Apple Watch Series 7 in colors pink, silver, and black"
            imgSrc="/img/image1.jpg"
          >
            <a href="#">
              <h5 className="text-sm font-semibold tracking-tight text-gray-900 dark:text-white">
                Apple Watch Series 7 GPS, Aluminium Case, Starlight Sport
              </h5>
            </a>
            <div className="flex items-center">
              <span className="ml-3 mr-2 rounded bg-cyan-100 px-2.5 text-xs font-semibold text-cyan-800 dark:bg-cyan-200 dark:text-cyan-800">
                5.0
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                $599
              </span>
            </div>
          </Card>
        ))}
      </div>
      <div className="mt-[100px] flex overflow-x-auto items-center">
        {temp.map((t, i) => (
          <Card
            key={i}
            className="max-w-[300px] shadow-none"
            imgAlt="Apple Watch Series 7 in colors pink, silver, and black"
            imgSrc="/img/image1.jpg"
          >
            <a href="#">
              <h5 className="text-sm font-semibold tracking-tight text-gray-900 dark:text-white">
                Apple Watch Series 7 GPS, Aluminium Case, Starlight Sport
              </h5>
            </a>
            <div className="flex items-center">
              <span className="ml-3 mr-2 rounded bg-cyan-100 px-2.5 text-xs font-semibold text-cyan-800 dark:bg-cyan-200 dark:text-cyan-800">
                5.0
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                $599
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HomeContent;

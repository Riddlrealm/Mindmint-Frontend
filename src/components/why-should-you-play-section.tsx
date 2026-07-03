const WhyShouldYouPlaySection = () => {
  return (
    <section id="why-play" className="max-lg:p-4 max-lg:items-center max-lg:py-10 max-lg:flex-col flex items-end justify-between bg-[#033330] text-white">
      <div className="">
        <img src="/images/quest-bg.png" alt="why-should-you-play" />
      </div>

      <div className="lg:pr-20 py-16 lg:py-20 max-w-3xl lg:w-[70%]">
        <h2 className="font-medium text-4xl lg:text-5xl pb-6">Why Should You Play?</h2>

        <div className="space-y-8 ">
          <p className="font-light text-xl">
            <strong className="font-medium text-3xl block">
              &nbsp; &bull; Learn While You Play:
            </strong>
            Enhance your knowledge in various subjects, from history to science
            and pop culture.
          </p>
          <p className="font-light text-xl">
            <strong className="font-medium text-3xl block">
              &nbsp; &bull; Compete with Friends:
            </strong>
            Invite friends to join you in Multiplayer mode and see who can
            achieve the highest score!
          </p>

          <p className="font-light text-xl">
            <strong className="font-medium text-3xl block">
              &nbsp; &bull; Flexible Play Options:
            </strong>
            Whether you want to practice at your own pace or compete against
            others, Mindmint has a mode for you.
          </p>
        </div>
      </div>
    </section>
  );
};

export default WhyShouldYouPlaySection;

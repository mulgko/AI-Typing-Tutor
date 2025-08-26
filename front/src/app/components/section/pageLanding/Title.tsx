import { titleVariants } from "./titleVariants";

const { section } = titleVariants();

export const Title = () => {
  return (
    <section className={section()}>
      <div className="pt-10 mb-4">
        <h2 className="font-bold-32 mb-2 dark:text-white">혜택</h2>
        <p className="text-gray-600 dark:text-gray-300">
          DisplayFlex만의 특별한 혜택을 만나보세요!
        </p>
      </div>
    </section>
  );
};

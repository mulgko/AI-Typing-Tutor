import { titleVariants } from "./titleVariants";

const { section } = titleVariants();

export const Title = () => {
  return (
    <section className={section()}>
      <div className="pt-10 mb-4">
        <h2 className="font-bold-32 mb-2 dark:text-white">AI 타이핑 테스트</h2>
        <p className="text-gray-600 dark:text-gray-300">
          AI가 생성한 맞춤형 지문으로 타이핑 실력을 향상 시키세요
        </p>
      </div>
    </section>
  );
};

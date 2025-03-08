import Link from 'next/link';

type Category = {
  name: string;
  slug: string;
  count: number;
};

type CategoryListProps = {
  categories: Category[];
  title?: string;
};

export default function CategoryList({ categories, title = 'カテゴリー' }: CategoryListProps) {
  return (
    <div className="category-list">
      {title && <h2 className="section-title">{title}</h2>}
      
      <ul className="categories">
        {categories.map((category) => (
          <li key={category.slug} className="category-item">
            <Link href={`/${category.slug}`} className="category-link">
              {category.name} <span className="count">({category.count})</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
} 
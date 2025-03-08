export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="site-footer">
      <div className="container">
        <p>© {currentYear} 栗林健太郎</p>
      </div>
    </footer>
  );
} 
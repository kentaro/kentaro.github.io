export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="site-footer">
      <div className="container">
        <p>© {currentYear} Kentaro Kuribayashi</p>
      </div>
    </footer>
  );
} 
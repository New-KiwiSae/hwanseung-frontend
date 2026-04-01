import React, { useState, useEffect } from 'react';
import styles from './Sidebar.module.css';

const Sidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const openSidebar = () => {
    setIsSidebarOpen(false); // since 'close' class means sidebar is collapsed, false means not closed? 
    // Wait, original: `sidebar.classList.toggle("close");` 
    // And `searchBtn.addEventListener("click", () => { sidebar.classList.remove("close"); });`
    // So 'close' class = collapsed. isSidebarOpen = true means expanded, so 'close' should be false.
    setIsSidebarOpen(true);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <>
      <nav className={`${styles.sidebar} ${!isSidebarOpen ? styles.close : ''}`}>
        <header>
          <div className={styles.imageText}>
            <span className={styles.image}>
              {/* If Images/Logo .png is unavailable, you can use a placeholder or bx icon */}
              <i className={`bx bx-store-alt ${styles.icon}`} style={{ fontSize: '30px', color: 'var(--primary-color)' }}></i>
            </span>

            <div className={`${styles.text} ${styles.logoText}`}>
              <span className={styles.name}>환승마켓</span>
              <span className={styles.profession}>관리자 (Admin)</span>
            </div>
          </div>

          <i className={`bx bx-chevron-right ${styles.toggle}`} onClick={toggleSidebar}></i>
        </header>

        <div className={styles.menuBar}>
          <div className={styles.menu}>
            <li className={styles.searchBox} onClick={openSidebar}>
              <i className={`bx bx-search ${styles.icon}`}></i>
              <input type="text" placeholder="Search..." />
            </li>

            <ul className={styles.menuLinks} style={{listStyle: "none", padding: 0}}>
              <li className={styles.navLink}>
                <a href="#">
                  <i className={`bx bx-grid-alt ${styles.icon}`}></i>
                  <span className={`${styles.text} ${styles.navText}`}>대시보드</span>
                </a>
              </li>

              <li className={styles.navLink}>
                <a href="#">
                  <i className={`bx bx-bar-chart-alt-2 ${styles.icon}`}></i>
                  <span className={`${styles.text} ${styles.navText}`}>통계</span>
                </a>
              </li>

              <li className={styles.navLink}>
                <a href="#">
                  <i className={`bx bx-bell ${styles.icon}`}></i>
                  <span className={`${styles.text} ${styles.navText}`}>알림</span>
                </a>
              </li>

              <li className={styles.navLink}>
                <a href="#">
                  <i className={`bx bx-user-x ${styles.icon}`}></i>
                  <span className={`${styles.text} ${styles.navText}`}>신고/정지</span>
                </a>
              </li>

              <li className={styles.navLink}>
                <a href="#">
                  <i className={`bx bx-group ${styles.icon}`}></i>
                  <span className={`${styles.text} ${styles.navText}`}>사용자 관리</span>
                </a>
              </li>

              <li className={styles.navLink}>
                <a href="#">
                  <i className={`bx bx-chat ${styles.icon}`}></i>
                  <span className={`${styles.text} ${styles.navText}`}>문의 내역</span>
                </a>
              </li>
            </ul>
          </div>

          <div className={styles.bottomContent}>
            <li style={{listStyle: "none"}}>
              <a href="#">
                <i className={`bx bx-log-out ${styles.icon}`}></i>
                <span className={`${styles.text} ${styles.navText}`}>Logout</span>
              </a>
            </li>

            <li className={styles.mode}>
              <div className={styles.sunMoon}>
                <i className={`bx bx-moon ${styles.icon} ${styles.moon}`}></i>
                <i className={`bx bx-sun ${styles.icon} ${styles.sun}`}></i>
              </div>
              <span className={`${styles.modeText} ${styles.text}`}>
                {isDarkMode ? 'Light mode' : 'Dark mode'}
              </span>

              <div className={styles.toggleSwitch} onClick={toggleDarkMode}>
                <span className={styles.switch}></span>
              </div>
            </li>
          </div>
        </div>
      </nav>

      <section className={styles.home}>
        <div className={styles.text}>환승마켓 관리자 페이지</div>
      </section>
    </>
  );
};

export default Sidebar;

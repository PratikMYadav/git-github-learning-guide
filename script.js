/**
 * GitMaster – Git & GitHub Learning Guide
 * Interactive JavaScript Engine
 * Features:
 * - Theme Switcher (Dark/Light mode with localStorage persistence)
 * - Copy-to-Clipboard with visual feedback & toast notification
 * - Live Command Filter & Category Switcher
 * - Interactive Checklist with localStorage state & rank calculation
 * - OS Installation Tab Switcher
 * - Scroll Progress Indicator & Table of Contents Spy
 * - Mobile Navigation Drawer
 * - Emergency Scenarios Accordion
 * - Back to Top Button
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* --------------------------------------------------------------------------
     1. Theme Management (Dark / Light Mode)
     -------------------------------------------------------------------------- */
  const themeToggleBtn = document.getElementById('theme-toggle');
  const STORAGE_KEY_THEME = 'gitmaster_theme';

  function initTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEY_THEME);
    if (savedTheme) {
      applyTheme(savedTheme);
    } else {
      // Default to dark theme, or match user system preference
      const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
      applyTheme(prefersLight ? 'light' : 'dark');
    }
  }

  function applyTheme(theme) {
    if (theme === 'light') {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
      if (themeToggleBtn) themeToggleBtn.setAttribute('title', 'Switch to Dark Mode');
    } else {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
      if (themeToggleBtn) themeToggleBtn.setAttribute('title', 'Switch to Light Mode');
    }
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const isCurrentlyLight = document.body.classList.contains('light-theme');
      const newTheme = isCurrentlyLight ? 'dark' : 'light';
      applyTheme(newTheme);
      localStorage.setItem(STORAGE_KEY_THEME, newTheme);
      showToast(`Switched to ${newTheme === 'light' ? 'Light' : 'Dark'} theme`);
    });
  }

  initTheme();

  /* --------------------------------------------------------------------------
     2. Scroll Progress Bar & Back to Top Button
     -------------------------------------------------------------------------- */
  const scrollProgressBar = document.getElementById('scroll-progress-bar');
  const backToTopBtn = document.getElementById('back-to-top');

  function handleScroll() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    
    if (scrollHeight > 0 && scrollProgressBar) {
      const scrollPercent = (scrollTop / scrollHeight) * 100;
      scrollProgressBar.style.width = `${Math.min(100, Math.max(0, scrollPercent))}%`;
    }

    if (backToTopBtn) {
      if (scrollTop > 350) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* --------------------------------------------------------------------------
     3. Toast Notification Utility
     -------------------------------------------------------------------------- */
  const toastElement = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');
  let toastTimer = null;

  function showToast(message, duration = 2200) {
    if (!toastElement || !toastMessage) return;

    toastMessage.textContent = message;
    toastElement.classList.add('show');

    if (toastTimer) clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
      toastElement.classList.remove('show');
    }, duration);
  }

  /* --------------------------------------------------------------------------
     4. Code Snippet Copy-to-Clipboard
     -------------------------------------------------------------------------- */
  const copyButtons = document.querySelectorAll('.copy-btn');

  copyButtons.forEach((btn) => {
    btn.addEventListener('click', async () => {
      let codeToCopy = btn.getAttribute('data-code');

      // Fallback: If no data-code, look inside the adjacent pre/code
      if (!codeToCopy) {
        const pre = btn.closest('.code-block-wrapper')?.querySelector('pre code');
        if (pre) {
          // Clone and clean prompt symbols for clean copying
          const clone = pre.cloneNode(true);
          clone.querySelectorAll('.prompt, .output, .comment').forEach(el => {
            if (el.classList.contains('prompt')) el.remove();
          });
          codeToCopy = clone.textContent.trim();
        }
      }

      if (!codeToCopy) return;

      try {
        await navigator.clipboard.writeText(codeToCopy);
        
        // Visual button feedback
        const originalText = btn.querySelector('.btn-text')?.textContent || 'Copy';
        const textSpan = btn.querySelector('.btn-text');
        
        btn.classList.add('copied');
        if (textSpan) textSpan.textContent = 'Copied!';

        showToast('Command copied to clipboard!');

        setTimeout(() => {
          btn.classList.remove('copied');
          if (textSpan) textSpan.textContent = originalText;
        }, 2000);
      } catch (err) {
        console.error('Failed to copy via Clipboard API, attempting fallback:', err);
        fallbackCopyText(codeToCopy, btn);
      }
    });
  });

  function fallbackCopyText(text, btn) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      if (successful) {
        btn.classList.add('copied');
        const textSpan = btn.querySelector('.btn-text');
        if (textSpan) textSpan.textContent = 'Copied!';
        showToast('Command copied to clipboard!');
        setTimeout(() => {
          btn.classList.remove('copied');
          if (textSpan) textSpan.textContent = 'Copy';
        }, 2000);
      } else {
        showToast('Could not copy command.');
      }
    } catch (err) {
      showToast('Copy command failed.');
    }
    document.body.removeChild(textArea);
  }

  /* --------------------------------------------------------------------------
     5. OS Installation Tab Switcher
     -------------------------------------------------------------------------- */
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach((tab) => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-tab');

      tabButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
      });
      tabContents.forEach(content => content.classList.remove('active'));

      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      const activeContent = document.getElementById(targetId);
      if (activeContent) {
        activeContent.classList.add('active');
      }
    });
  });

  /* --------------------------------------------------------------------------
     6. Command Filtering & Search
     -------------------------------------------------------------------------- */
  const commandFilterInput = document.getElementById('command-filter-input');
  const globalSearchInput = document.getElementById('global-search-input');
  const mobileSearchInput = document.getElementById('mobile-search-input');
  const categoryPills = document.querySelectorAll('.pill-btn');
  const commandCards = document.querySelectorAll('.command-card');
  const commandsListContainer = document.getElementById('commands-list');

  let activeCategory = 'all';
  let activeSearchQuery = '';

  function filterCommands() {
    let matchCount = 0;

    commandCards.forEach((card) => {
      const cardCategory = card.getAttribute('data-category');
      const keywords = (card.getAttribute('data-keywords') || '').toLowerCase();
      const cardName = (card.querySelector('.cmd-name')?.textContent || '').toLowerCase();
      const cardSummary = (card.querySelector('.cmd-summary')?.textContent || '').toLowerCase();
      const allText = `${keywords} ${cardName} ${cardSummary}`;

      const matchesCategory = (activeCategory === 'all' || cardCategory === activeCategory);
      const matchesSearch = activeSearchQuery === '' || allText.includes(activeSearchQuery.toLowerCase().trim());

      if (matchesCategory && matchesSearch) {
        card.style.display = 'flex';
        matchCount++;
      } else {
        card.style.display = 'none';
      }
    });

    // Check if empty state needed
    let emptyState = document.getElementById('no-commands-found');
    if (matchCount === 0) {
      if (!emptyState && commandsListContainer) {
        emptyState = document.createElement('div');
        emptyState.id = 'no-commands-found';
        emptyState.className = 'glass-card';
        emptyState.style.textAlign = 'center';
        emptyState.style.padding = '3rem 1.5rem';
        emptyState.innerHTML = `
          <h4 style="font-size: 1.2rem; margin-bottom: 0.5rem; color: var(--brand-orange);">No commands found</h4>
          <p class="text-secondary" style="font-size: 0.9rem; margin-bottom: 1rem;">No commands matched the keyword "<strong>${activeSearchQuery}</strong>" in the selected category.</p>
          <button id="reset-filter-btn" class="btn btn-secondary btn-sm" style="margin: 0 auto;">Clear Filter</button>
        `;
        commandsListContainer.appendChild(emptyState);

        document.getElementById('reset-filter-btn')?.addEventListener('click', () => {
          if (commandFilterInput) commandFilterInput.value = '';
          if (globalSearchInput) globalSearchInput.value = '';
          if (mobileSearchInput) mobileSearchInput.value = '';
          activeSearchQuery = '';
          activeCategory = 'all';
          categoryPills.forEach(p => p.classList.toggle('active', p.getAttribute('data-category') === 'all'));
          filterCommands();
        });
      }
    } else if (emptyState) {
      emptyState.remove();
    }
  }

  // Category Pills Listener
  categoryPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      categoryPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeCategory = pill.getAttribute('data-category') || 'all';
      filterCommands();
    });
  });

  // Search Input Listeners
  if (commandFilterInput) {
    commandFilterInput.addEventListener('input', (e) => {
      activeSearchQuery = e.target.value;
      filterCommands();
    });
  }

  if (globalSearchInput) {
    globalSearchInput.addEventListener('input', (e) => {
      activeSearchQuery = e.target.value;
      if (commandFilterInput) commandFilterInput.value = activeSearchQuery;
      filterCommands();
    });

    // Press Enter to scroll smoothly to commands
    globalSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const commandsSection = document.getElementById('commands');
        if (commandsSection) {
          commandsSection.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  }

  if (mobileSearchInput) {
    mobileSearchInput.addEventListener('input', (e) => {
      activeSearchQuery = e.target.value;
      if (commandFilterInput) commandFilterInput.value = activeSearchQuery;
      filterCommands();
    });

    mobileSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        closeMobileDrawer();
        const commandsSection = document.getElementById('commands');
        if (commandsSection) {
          commandsSection.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  }

  // Keyboard shortcut '/' to focus global search
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== globalSearchInput && document.activeElement !== commandFilterInput) {
      e.preventDefault();
      if (globalSearchInput) {
        globalSearchInput.focus();
        globalSearchInput.select();
      }
    }
  });

  /* --------------------------------------------------------------------------
     7. Interactive Learning Checklist (LocalStorage + Rank Engine)
     -------------------------------------------------------------------------- */
  const CHECKLIST_STORAGE_KEY = 'gitmaster_learning_checklist_v1';
  const taskCheckboxes = document.querySelectorAll('.task-checkbox');
  const checklistCounterText = document.getElementById('checklist-counter-text');
  const checklistPercentage = document.getElementById('checklist-percentage');
  const checklistBarFill = document.getElementById('checklist-bar-fill');
  const navChecklistCounter = document.getElementById('nav-checklist-counter');
  const userRankBadge = document.getElementById('user-rank-badge');
  const widgetProgressFill = document.getElementById('widget-progress-fill');
  const widgetSubtext = document.getElementById('widget-subtext');
  const widgetBadge = document.getElementById('widget-badge');
  const drawerProgressText = document.getElementById('drawer-progress-text');

  const checkAllBtn = document.getElementById('check-all-btn');
  const resetChecklistBtn = document.getElementById('reset-checklist-btn');

  const totalTasks = taskCheckboxes.length || 16;

  function loadChecklistState() {
    let savedTasks = [];
    try {
      const raw = localStorage.getItem(CHECKLIST_STORAGE_KEY);
      if (raw) savedTasks = JSON.parse(raw);
    } catch (err) {
      console.warn('Could not parse saved checklist:', err);
    }

    taskCheckboxes.forEach((checkbox) => {
      const taskId = checkbox.id;
      const isChecked = savedTasks.includes(taskId);
      checkbox.checked = isChecked;

      const taskLabel = checkbox.closest('.task-item');
      if (taskLabel) {
        taskLabel.classList.toggle('checked', isChecked);
      }
    });

    updateChecklistUI();
  }

  function saveChecklistState() {
    const checkedIds = [];
    taskCheckboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        checkedIds.push(checkbox.id);
      }
    });

    try {
      localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(checkedIds));
    } catch (err) {
      console.warn('Could not save checklist to localStorage:', err);
    }

    updateChecklistUI();
  }

  function updateChecklistUI() {
    let completedCount = 0;
    taskCheckboxes.forEach((checkbox) => {
      if (checkbox.checked) completedCount++;
    });

    const percent = Math.round((completedCount / totalTasks) * 100);

    // Update Text Elements
    if (checklistCounterText) {
      checklistCounterText.textContent = `${completedCount} of ${totalTasks} tasks verified`;
    }
    if (checklistPercentage) {
      checklistPercentage.textContent = `${percent}% Completed`;
    }
    if (navChecklistCounter) {
      navChecklistCounter.textContent = `${completedCount}/${totalTasks}`;
    }
    if (widgetSubtext) {
      widgetSubtext.textContent = `${completedCount} of ${totalTasks} completed`;
    }
    if (widgetBadge) {
      widgetBadge.textContent = `${percent}%`;
    }
    if (drawerProgressText) {
      drawerProgressText.textContent = `${percent}% (${completedCount}/${totalTasks})`;
    }

    // Update Progress Bars
    if (checklistBarFill) {
      checklistBarFill.style.width = `${percent}%`;
    }
    if (widgetProgressFill) {
      widgetProgressFill.style.width = `${percent}%`;
    }

    // Compute Developer Rank Title
    let rank = 'Git Novice';
    if (percent === 100) {
      rank = 'Git & GitHub Guru 🎉';
    } else if (percent >= 75) {
      rank = 'Repository Master 🚀';
    } else if (percent >= 50) {
      rank = 'Branch Practitioner ⚡';
    } else if (percent >= 25) {
      rank = 'Terminal Cadet 💻';
    }

    if (userRankBadge) {
      userRankBadge.textContent = rank;
    }
  }

  // Checkbox Change Event Delegation
  taskCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      const taskLabel = checkbox.closest('.task-item');
      if (taskLabel) {
        taskLabel.classList.toggle('checked', checkbox.checked);
      }
      saveChecklistState();

      if (checkbox.checked) {
        showToast('Task checked! Progress saved.');
      }
    });
  });

  // Check All / Reset Buttons
  if (checkAllBtn) {
    checkAllBtn.addEventListener('click', () => {
      taskCheckboxes.forEach((cb) => {
        cb.checked = true;
        const taskLabel = cb.closest('.task-item');
        if (taskLabel) taskLabel.classList.add('checked');
      });
      saveChecklistState();
      showToast('All 16 checklist tasks completed!');
    });
  }

  if (resetChecklistBtn) {
    resetChecklistBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset your checklist progress?')) {
        taskCheckboxes.forEach((cb) => {
          cb.checked = false;
          const taskLabel = cb.closest('.task-item');
          if (taskLabel) taskLabel.classList.remove('checked');
        });
        saveChecklistState();
        showToast('Checklist progress reset.');
      }
    });
  }

  loadChecklistState();

  /* --------------------------------------------------------------------------
     8. Mobile Navigation Drawer
     -------------------------------------------------------------------------- */
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const drawerCloseBtn = document.getElementById('drawer-close');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileBackdrop = document.getElementById('mobile-backdrop');
  const drawerLinks = document.querySelectorAll('.drawer-link');

  function openMobileDrawer() {
    if (mobileDrawer) mobileDrawer.classList.add('open');
    if (mobileBackdrop) mobileBackdrop.classList.add('active');
    if (mobileMenuBtn) mobileMenuBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileDrawer() {
    if (mobileDrawer) mobileDrawer.classList.remove('open');
    if (mobileBackdrop) mobileBackdrop.classList.remove('active');
    if (mobileMenuBtn) mobileMenuBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      const isOpen = mobileDrawer?.classList.contains('open');
      if (isOpen) {
        closeMobileDrawer();
      } else {
        openMobileDrawer();
      }
    });
  }

  if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeMobileDrawer);
  if (mobileBackdrop) mobileBackdrop.addEventListener('click', closeMobileDrawer);

  drawerLinks.forEach((link) => {
    link.addEventListener('click', closeMobileDrawer);
  });

  /* --------------------------------------------------------------------------
     9. Emergency Scenarios Accordion
     -------------------------------------------------------------------------- */
  const accordionHeaders = document.querySelectorAll('.accordion-header');

  accordionHeaders.forEach((header) => {
    header.addEventListener('click', () => {
      const item = header.closest('.accordion-item');
      const isOpen = item.classList.contains('open');

      // Close other accordions for neatness
      accordionHeaders.forEach(otherHeader => {
        const otherItem = otherHeader.closest('.accordion-item');
        if (otherItem !== item) {
          otherItem.classList.remove('open');
          otherHeader.setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle clicked item
      item.classList.toggle('open', !isOpen);
      header.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  /* --------------------------------------------------------------------------
     10. Scroll Spy for Sidebar Table of Contents
     -------------------------------------------------------------------------- */
  const sections = document.querySelectorAll('section[id]');
  const sidebarLinks = document.querySelectorAll('.sidebar-link[href^="#"]');

  function updateSidebarSpy() {
    const scrollPos = window.scrollY + 120;

    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        sidebarLinks.forEach((link) => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateSidebarSpy, { passive: true });

  console.log('GitMaster – Git & GitHub Learning Guide initialized successfully.');
});

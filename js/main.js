// البيانات العالمية
let allArtworks = [];

// تحميل البيانات من JSON
async function loadArtworks() {
    try {
        const response = await fetch('data/artworks.json');
        const data = await response.json();
        allArtworks = data.artworks;
        return allArtworks;
    } catch (error) {
        console.error('خطأ في تحميل البيانات:', error);
        return [];
    }
}

// عرض البطاقات في أي حاوية
function displayArtworks(artworks, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (!artworks || artworks.length === 0) {
        container.innerHTML = '<div class="loading">لا توجد أعمال فنية مطابقة</div>';
        return;
    }
    
    container.innerHTML = artworks.map(art => `
        <div class="art-card" onclick="goToDetails(${art.id})">
            <img src="${art.imageUrl}" alt="${art.title}" loading="lazy">
            <div class="art-info">
                <h3>${art.title}</h3>
                <p>${art.artist}</p>
                <span class="mood-badge">🎭 ${getMoodArabic(art.mood)}</span>
            </div>
        </div>
    `).join('');
}

// ترجمة المزاج للعربية
function getMoodArabic(mood) {
    const moods = {
        'سعيد': 'سعيد',
        'حزين': 'حزين',
        'هادئ': 'هادئ',
        'غامض': 'غامض'
    };
    return moods[mood] || mood;
}

// الذهاب لصفحة التفاصيل
function goToDetails(id) {
    window.location.href = `details.html?id=${id}`;
}

// تحميل الصفحة الرئيسية
async function loadHomePage() {
    const artworks = await loadArtworks();
    const featured = artworks.slice(0, 3);
    displayArtworks(featured, 'featuredGrid');
}

// تحميل صفحة المعرض
async function loadGalleryPage() {
    const artworks = await loadArtworks();
    displayArtworks(artworks, 'galleryGrid');
}

// تحميل صفحة التفاصيل
async function loadDetailsPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = parseInt(urlParams.get('id'));
    
    if (!id) {
        document.getElementById('detailContainer').innerHTML = '<div class="loading">لم يتم العثور على العمل الفني</div>';
        return;
    }
    
    const artworks = await loadArtworks();
    const artwork = artworks.find(a => a.id === id);
    
    if (!artwork) {
        document.getElementById('detailContainer').innerHTML = '<div class="loading">العمل الفني غير موجود</div>';
        return;
    }
    
    document.getElementById('detailContainer').innerHTML = `
        <img src="${artwork.imageUrl}" alt="${artwork.title}">
        <h1>${artwork.title}</h1>
        <p><strong>الفنان:</strong> ${artwork.artist}</p>
        <p><strong>المزاج:</strong> 🎭 ${getMoodArabic(artwork.mood)}</p>
        <p><strong>التصنيف:</strong> ${artwork.category}</p>
        <p><strong>العام:</strong> ${artwork.year}</p>
        <p><strong>الوصف:</strong> ${artwork.description}</p>
        <a href="gallery.html" class="btn-primary" style="margin-top: 2rem; display: inline-block;">العودة إلى المعرض</a>
    `;
}

// ========== صفحة البحث والفلترة (تم إعادة كتابتها بالكامل) ==========
async function setupSearchPage() {
    // انتظر تحميل البيانات
    const artworks = await loadArtworks();
    
    // المتغيرات
    let currentMood = 'all';
    let currentSearchText = '';
    
    // العناصر في الصفحة
    const searchResultsDiv = document.getElementById('searchResults');
    const resultCountDiv = document.getElementById('resultCount');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    // دالة التصفية والبحث معًا
    function filterAndDisplay() {
        // 1. نبدأ بكل الأعمال
        let filtered = [...artworks];
        
        // 2. تطبيق فلتر المزاج (إذا لم يكن 'all')
        if (currentMood !== 'all') {
            filtered = filtered.filter(art => art.mood === currentMood);
        }
        
        // 3. تطبيق البحث النصي (إذا كان هناك نص)
        if (currentSearchText.trim() !== '') {
            const searchLower = currentSearchText.trim().toLowerCase();
            filtered = filtered.filter(art => 
                art.title.toLowerCase().includes(searchLower) ||
                art.description.toLowerCase().includes(searchLower) ||
                art.artist.toLowerCase().includes(searchLower)
            );
        }
        
        // 4. عرض النتائج
        if (filtered.length === 0) {
            searchResultsDiv.innerHTML = '<div class="loading">😔 لا توجد أعمال فنية مطابقة</div>';
            resultCountDiv.innerHTML = '<p>🔍 0 نتيجة</p>';
        } else {
            searchResultsDiv.innerHTML = filtered.map(art => `
                <div class="art-card" onclick="goToDetails(${art.id})">
                    <img src="${art.imageUrl}" alt="${art.title}" loading="lazy">
                    <div class="art-info">
                        <h3>${art.title}</h3>
                        <p>${art.artist}</p>
                        <span class="mood-badge">🎭 ${getMoodArabic(art.mood)}</span>
                    </div>
                </div>
            `).join('');
            resultCountDiv.innerHTML = `<p>🔍 تم العثور على ${filtered.length} نتيجة</p>`;
        }
    }
    
    // إضافة مستمعات الأحداث لأزرار الفلتر
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // إزالة الـ active من جميع الأزرار
            filterBtns.forEach(b => b.classList.remove('active'));
            // إضافة active للزر الحالي
            this.classList.add('active');
            // تحديث المزاج الحالي
            currentMood = this.getAttribute('data-mood');
            // إعادة التصفية والعرض
            filterAndDisplay();
        });
    });
    
    // إضافة مستمعات أحداث للبحث
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            currentSearchText = searchInput.value;
            filterAndDisplay();
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                currentSearchText = searchInput.value;
                filterAndDisplay();
            }
        });
    }
    
    // العرض الأولي: كل الأعمال
    filterAndDisplay();
}

// تحديد أي صفحة نحن فيها
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    const page = path.split('/').pop();
    
    if (page === 'index.html' || page === '' || page === '/') {
        loadHomePage();
    } else if (page === 'gallery.html') {
        loadGalleryPage();
    } else if (page === 'details.html') {
        loadDetailsPage();
    } else if (page === 'search.html') {
        setupSearchPage();
    } else if (page === 'about.html') {
        // صفحة عن المعرض لا تحتاج تحميل بيانات
        console.log('صفحة عن المعرض');
    }
});
// ========== صفحة البحث (نسخة مبسطة ونظيفة) ==========
async function initSearchPage() {
    console.log('تم تحميل صفحة البحث');
    
    // تحميل البيانات
    let artworks = [];
    try {
        const response = await fetch('data/artworks.json');
        const data = await response.json();
        artworks = data.artworks;
        console.log('تم تحميل', artworks.length, 'عمل فني');
    } catch (error) {
        console.error('خطأ في التحميل:', error);
        document.getElementById('searchResults').innerHTML = '<div class="loading">خطأ في تحميل البيانات</div>';
        return;
    }
    
    let currentMood = 'all';
    let currentSearch = '';
    
    const searchResultsDiv = document.getElementById('searchResults');
    const resultCountDiv = document.getElementById('resultCount');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    function renderResults() {
        let filtered = [...artworks];
        
        // تطبيق الفلتر
        if (currentMood !== 'all') {
            filtered = filtered.filter(art => art.mood === currentMood);
        }
        
        // تطبيق البحث (يشمل المزاج أيضًا)
if (currentSearch.trim() !== '') {
    const searchTerm = currentSearch.trim().toLowerCase();
    filtered = filtered.filter(art => 
        art.title.toLowerCase().includes(searchTerm) ||
        art.description.toLowerCase().includes(searchTerm) ||
        art.artist.toLowerCase().includes(searchTerm) ||
        art.mood.toLowerCase().includes(searchTerm)  // <-- هذا السطر الجديد
    );
}
        
        console.log('النتائج:', filtered.length, 'عمل - المزاج:', currentMood, '- البحث:', currentSearch);
        
        // عرض النتائج
        if (filtered.length === 0) {
            searchResultsDiv.innerHTML = '<div class="loading">😔 لا توجد أعمال فنية مطابقة</div>';
            resultCountDiv.innerHTML = '🔍 0 نتيجة';
        } else {
            searchResultsDiv.innerHTML = filtered.map(art => `
                <div class="art-card" onclick="goToDetails(${art.id})">
                    <img src="${art.imageUrl}" alt="${art.title}" loading="lazy">
                    <div class="art-info">
                        <h3>${art.title}</h3>
                        <p>${art.artist}</p>
                        <span class="mood-badge">🎭 ${art.mood}</span>
                    </div>
                </div>
            `).join('');
            resultCountDiv.innerHTML = `🔍 ${filtered.length} نتيجة`;
        }
    }
    
    // أزرار الفلتر
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMood = btn.getAttribute('data-mood');
            renderResults();
        });
    });
    
    // زر البحث
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            currentSearch = searchInput.value;
            renderResults();
        });
    }
    
    // Enter في مربع البحث
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                currentSearch = searchInput.value;
                renderResults();
            }
        });
    }
    
    // العرض الأولي
    renderResults();
}

// تعديل دالة تحديد الصفحة
const originalDOMContentLoaded = document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    const page = path.split('/').pop();
    
    if (page === 'index.html' || page === '' || page === '/') {
        loadHomePage();
    } else if (page === 'gallery.html') {
        loadGalleryPage();
    } else if (page === 'details.html') {
        loadDetailsPage();
    } else if (page === 'search.html') {
        initSearchPage();
    }
});

// إزالة المستمع القديم وإضافة الجديد (لتجنب التكرار)
document.removeEventListener('DOMContentLoaded', originalDOMContentLoaded);
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    const page = path.split('/').pop();
    
    if (page === 'index.html' || page === '' || page === '/') {
        loadHomePage();
    } else if (page === 'gallery.html') {
        loadGalleryPage();
    } else if (page === 'details.html') {
        loadDetailsPage();
    } else if (page === 'search.html') {
        initSearchPage();
    }
});
// ========== Supabase client (shared) ==========
function initSupabaseClient() {
    if (window.supabaseClient) return window.supabaseClient;

    const configured = typeof SUPABASE_URL !== 'undefined'
        && typeof SUPABASE_ANON_KEY !== 'undefined'
        && SUPABASE_URL !== 'YOUR_SUPABASE_URL'
        && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY'
        && window.supabase;

    if (!configured) return null;

    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return window.supabaseClient;
}

let currentUser = null;
let currentProfile = null;

function getCurrentUserId() {
    return currentUser?.id || null;
}

async function initAuth() {
    const client = initSupabaseClient();
    if (!client) return;

    const { data: { session } } = await client.auth.getSession();
    if (session?.user) {
        await handleUserSession(session.user);
    } else {
        updateAuthUI();
    }

    client.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
            await handleUserSession(session.user, event === 'SIGNED_IN');
        } else {
            handleSignOutUI();
        }
    });
}

async function handleUserSession(user, showWelcome = false) {
    currentUser = user;
    await loadOrCreateProfile();
    updateAuthUI();
    prefillCheckoutForm();
    if (showWelcome) showToast(`Xin chào, ${getDisplayName()}!`);
}

function handleSignOutUI() {
    currentUser = null;
    currentProfile = null;
    updateAuthUI();
    prefillCheckoutForm();
    closeUserDropdown();
}

async function loadOrCreateProfile() {
    const client = window.supabaseClient;
    if (!client || !currentUser) return;

    const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();

    if (data) {
        currentProfile = data;
        return;
    }

    if (error && error.code !== 'PGRST116') {
        console.warn('Không tải được profile:', error.message);
    }

    const meta = currentUser.user_metadata || {};
    currentProfile = {
        id: currentUser.id,
        full_name: meta.full_name || meta.name || '',
        avatar_url: meta.avatar_url || meta.picture || '',
        email: currentUser.email || '',
        phone: '',
        address: ''
    };

    const { error: upsertError } = await client.from('profiles').upsert(currentProfile);
    if (upsertError) {
        console.warn('Không lưu được profile:', upsertError.message);
    }
}

function getDisplayName() {
    const name = currentProfile?.full_name || currentUser?.user_metadata?.full_name || currentUser?.user_metadata?.name || currentUser?.email;
    if (!name) return 'Bạn';
    return name.split(' ')[0];
}

function getFullName() {
    return currentProfile?.full_name
        || currentUser?.user_metadata?.full_name
        || currentUser?.user_metadata?.name
        || currentUser?.email
        || 'Bạn';
}

function getUserInitial() {
    const name = getFullName();
    return name.charAt(0).toUpperCase();
}

function getAvatarUrl() {
    if (!currentUser) return '';
    return currentProfile?.avatar_url
        || currentUser.user_metadata?.avatar_url
        || currentUser.user_metadata?.picture
        || '';
}

function setAvatarImage(imgEl, fallbackEl, url) {
    if (!imgEl || !fallbackEl) return;

    if (url) {
        imgEl.src = url;
        imgEl.alt = getFullName();
        imgEl.hidden = false;
        fallbackEl.hidden = true;
        imgEl.onerror = () => {
            imgEl.hidden = true;
            fallbackEl.hidden = false;
            fallbackEl.textContent = getUserInitial();
        };
    } else {
        imgEl.hidden = true;
        fallbackEl.hidden = false;
        fallbackEl.textContent = getUserInitial();
    }
}

function updateAuthUI() {
    const authArea = document.getElementById('authArea');
    const mobileLogin = document.getElementById('mobileLoginBtn');
    const mobileUserCard = document.getElementById('mobileUserCard');
    const mobileSignOut = document.getElementById('mobileSignOutBtn');

    if (authArea) {
        authArea.classList.remove('auth-loading', 'auth-guest', 'auth-user');
        authArea.classList.add(currentUser ? 'auth-user' : 'auth-guest');
    }

    if (currentUser) {
        if (mobileLogin) mobileLogin.hidden = true;
        if (mobileUserCard) mobileUserCard.hidden = false;
        if (mobileSignOut) mobileSignOut.hidden = false;

        const displayName = getDisplayName();
        const fullName = getFullName();
        const email = currentUser.email || '';
        const avatarUrl = getAvatarUrl();

        const userName = document.getElementById('userName');
        const userEmail = document.getElementById('userEmail');
        const dropdownName = document.getElementById('dropdownName');
        const dropdownEmail = document.getElementById('dropdownEmail');
        const userAvatar = document.getElementById('userAvatar');
        const userAvatarFallback = document.getElementById('userAvatarFallback');
        const mobileUserName = document.getElementById('mobileUserName');
        const mobileUserEmail = document.getElementById('mobileUserEmail');
        const mobileUserAvatar = document.getElementById('mobileUserAvatar');

        if (userName) userName.textContent = displayName;
        if (userEmail) userEmail.textContent = email;
        if (dropdownName) dropdownName.textContent = fullName;
        if (dropdownEmail) dropdownEmail.textContent = email;
        if (mobileUserName) mobileUserName.textContent = fullName;
        if (mobileUserEmail) mobileUserEmail.textContent = email;

        setAvatarImage(userAvatar, userAvatarFallback, avatarUrl);

        if (mobileUserAvatar) {
            if (avatarUrl) {
                mobileUserAvatar.innerHTML = `<img src="${avatarUrl}" alt="${fullName}">`;
            } else {
                mobileUserAvatar.textContent = getUserInitial();
            }
        }
    } else {
        if (mobileLogin) mobileLogin.hidden = false;
        if (mobileUserCard) mobileUserCard.hidden = true;
        if (mobileSignOut) mobileSignOut.hidden = true;
    }
}

async function signInWithGoogle() {
    const client = initSupabaseClient();
    if (!client) {
        showToast('Chưa cấu hình Supabase. Liên hệ quản trị viên.');
        return;
    }

    const { error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.href.split('#')[0]
        }
    });

    if (error) {
        console.error('Google login error:', error);
        showToast('Không thể đăng nhập Google. Thử lại sau.');
    }
}

async function signOut() {
    const client = window.supabaseClient;
    if (!client) return;

    closeUserDropdown();
    const { error } = await client.auth.signOut();
    if (error) {
        showToast('Không thể đăng xuất.');
        return;
    }
    handleSignOutUI();
    showToast('Đã đăng xuất.');
}

function toggleUserDropdown() {
    const dropdown = document.getElementById('userDropdown');
    const menuBtn = document.getElementById('userMenuBtn');
    const isOpen = dropdown?.classList.toggle('open');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
}

function closeUserDropdown() {
    const dropdown = document.getElementById('userDropdown');
    const menuBtn = document.getElementById('userMenuBtn');
    if (dropdown) dropdown.classList.remove('open');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
}

function openAccountModal() {
    closeUserDropdown();
    if (!currentUser) {
        signInWithGoogle();
        return;
    }

    const modal = document.getElementById('accountModal');
    if (!modal) return;

    document.getElementById('accountName').value = currentProfile?.full_name || '';
    document.getElementById('accountPhone').value = currentProfile?.phone || '';
    document.getElementById('accountAddress').value = currentProfile?.address || '';
    document.getElementById('accountEmail').value = currentUser.email || '';

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

async function saveAccountProfile(e) {
    e.preventDefault();
    if (!currentUser || !window.supabaseClient) return;

    const name = document.getElementById('accountName').value.trim();
    const phone = document.getElementById('accountPhone').value.trim();
    const address = document.getElementById('accountAddress').value.trim();

    const { error } = await window.supabaseClient.from('profiles').upsert({
        id: currentUser.id,
        full_name: name,
        phone,
        address,
        email: currentUser.email,
        avatar_url: currentProfile?.avatar_url || null,
        updated_at: new Date().toISOString()
    });

    if (error) {
        showToast('Không lưu được thông tin. Chạy supabase-auth.sql trên Supabase.');
        return;
    }

    currentProfile = { ...currentProfile, full_name: name, phone, address };
    updateAuthUI();
    prefillCheckoutForm();
    closeModal('accountModal');
    showToast('Đã lưu thông tin tài khoản!');
}

function prefillCheckoutForm() {
    const nameEl = document.getElementById('checkoutName');
    const phoneEl = document.getElementById('checkoutPhone');
    const addressEl = document.getElementById('checkoutAddress');
    const emailEl = document.getElementById('checkoutEmail');

    if (!currentUser) {
        if (emailEl) {
            emailEl.readOnly = false;
            emailEl.placeholder = 'email@example.com';
        }
        return;
    }

    if (nameEl) nameEl.value = currentProfile?.full_name || currentUser.user_metadata?.full_name || '';
    if (phoneEl) phoneEl.value = currentProfile?.phone || '';
    if (addressEl) addressEl.value = currentProfile?.address || '';
    if (emailEl) {
        emailEl.value = currentUser.email || '';
        emailEl.readOnly = true;
    }
}

async function saveUserProfileFromCheckout({ name, phone, address }) {
    if (!currentUser || !window.supabaseClient) return;

    const { error } = await window.supabaseClient.from('profiles').upsert({
        id: currentUser.id,
        full_name: name,
        phone,
        address,
        email: currentUser.email,
        avatar_url: currentProfile?.avatar_url || null,
        updated_at: new Date().toISOString()
    });

    if (!error) {
        currentProfile = { ...currentProfile, full_name: name, phone, address };
    }
}

document.addEventListener('click', (e) => {
    const menu = document.getElementById('userMenu');
    if (menu && !menu.contains(e.target)) {
        closeUserDropdown();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    initAuth();
});

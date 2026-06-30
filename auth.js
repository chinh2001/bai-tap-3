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
    const name = currentProfile?.full_name || currentUser?.user_metadata?.full_name || currentUser?.email;
    if (!name) return 'Bạn';
    return name.split(' ')[0];
}

function updateAuthUI() {
    const loginBtn = document.getElementById('loginBtn');
    const userMenu = document.getElementById('userMenu');
    const mobileLogin = document.getElementById('mobileLoginBtn');
    const mobileUser = document.getElementById('mobileUserInfo');

    if (currentUser) {
        if (loginBtn) loginBtn.hidden = true;
        if (userMenu) userMenu.hidden = false;
        if (mobileLogin) mobileLogin.hidden = true;
        if (mobileUser) {
            mobileUser.hidden = false;
            mobileUser.textContent = getDisplayName();
        }

        const userName = document.getElementById('userName');
        const userAvatar = document.getElementById('userAvatar');
        if (userName) userName.textContent = getDisplayName();
        if (userAvatar) {
            const url = currentProfile?.avatar_url || currentUser.user_metadata?.avatar_url || currentUser.user_metadata?.picture;
            if (url) {
                userAvatar.src = url;
                userAvatar.hidden = false;
            } else {
                userAvatar.hidden = true;
            }
        }
    } else {
        if (loginBtn) loginBtn.hidden = false;
        if (userMenu) userMenu.hidden = true;
        if (mobileLogin) mobileLogin.hidden = false;
        if (mobileUser) mobileUser.hidden = true;
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
    if (dropdown) dropdown.classList.toggle('open');
}

function closeUserDropdown() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) dropdown.classList.remove('open');
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

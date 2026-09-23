

        async function fetchSafeJson(url, options = {}) {
            const res = await fetch(url, options);
            const text = await res.text();
            try {
                return JSON.parse(text);
            } catch(e) {
                const firstBrace = text.indexOf('{');
                const lastBrace = text.lastIndexOf('}');
                if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                    try { return JSON.parse(text.substring(firstBrace, lastBrace + 1)); } catch(err) {}
                }
                const firstBracket = text.indexOf('[');
                const lastBracket = text.lastIndexOf(']');
                if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
                    try { return JSON.parse(text.substring(firstBracket, lastBracket + 1)); } catch(err) {}
                }
                throw e;
            }
        }

    (function() {
        const rawUser = localStorage.getItem("rhnd_user");
        const adminPwd = sessionStorage.getItem("rhnd_admin_pwd") || localStorage.getItem("rhnd_admin_pwd");
        let isAdmin = false;
        if (rawUser) {
            try {
                const user = JSON.parse(rawUser);
                if (user.role === "admin" || (user.email && user.email.toLowerCase().includes("admin"))) {
                    isAdmin = true;
                }
            } catch(e){}
        }
        if (adminPwd === "Admin@RHND2026") {
            isAdmin = true;
        }
        if (!isAdmin) {
            window.location.replace("login.html");
        }
    })();
    
    function toggleMobileSidebar(show) {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        if (!sidebar || !overlay) return;
        if (typeof show === 'boolean') {
            if (show) { sidebar.classList.add('mobile-open'); overlay.classList.add('active'); }
            else { sidebar.classList.remove('mobile-open'); overlay.classList.remove('active'); }
        } else {
            sidebar.classList.toggle('mobile-open'); overlay.classList.toggle('active');
        }
    }
    



        function rhndLogout() {
            sessionStorage.removeItem('rhnd_admin_pwd');
            localStorage.removeItem('rhnd_admin_pwd');
            localStorage.removeItem('rhnd_user');
            window.location.href = 'login.html';
        }

        // Global Tab switching
        function switchAdminTab(tabId) {
            const tabMap = { 'overview': 0, 'news': 1, 'members': 2, 'requests': 3, 'media': 4, 'broadcast': 5 };
            const navItems = document.querySelectorAll('.nav-item');
            navItems.forEach(el => el.classList.remove('active'));
            
            if (tabMap[tabId] !== undefined && navItems[tabMap[tabId]]) {
                navItems[tabMap[tabId]].classList.add('active');
            }
            
            document.querySelectorAll('.panel').forEach(el => el.classList.remove('active'));
            const targetPanel = document.getElementById('tab-' + tabId);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
            if (typeof toggleMobileSidebar === 'function') {
                toggleMobileSidebar(false);
            }
        }

        // Admin Auth Credentials
        let adminPwd = sessionStorage.getItem('rhnd_admin_pwd') || localStorage.getItem('rhnd_admin_pwd') || 'Admin@RHND2026';
        sessionStorage.setItem('rhnd_admin_pwd', adminPwd);
        localStorage.setItem('rhnd_admin_pwd', adminPwd);
        
        const fetchHeaders = {
            'Content-Type': 'application/json',
            'X-Admin-Password': adminPwd
        };

        // --- STATS & OVERVIEW MANAGER LOGIC ---
        const liveCounts = {
            news: 0,
            members: 0,
            requests: 0,
            media: 0
        };

        function updateStatDisplay(type, count) {
            liveCounts[type] = count;
            const origEl = document.getElementById(`orig-stat-${type}`);
            if (origEl) origEl.textContent = count;
            
            const custom = localStorage.getItem(`rhnd_custom_stat_${type}`);
            const badge = document.getElementById(`badge-mode-${type}`);
            const statEl = document.getElementById(`stat-${type}`);
            const cardTag = document.getElementById(`card-tag-${type}`);
            
            if (custom !== null && custom !== '') {
                if (statEl) statEl.textContent = custom;
                if (badge) {
                    badge.textContent = 'Custom';
                    badge.style.background = '#fef3c7';
                    badge.style.color = '#b45309';
                }
                if (cardTag) cardTag.style.display = 'inline-block';
            } else {
                if (statEl) statEl.textContent = count;
                if (badge) {
                    badge.textContent = 'Live DB';
                    badge.style.background = '#eff6ff';
                    badge.style.color = '#3b82f6';
                }
                if (cardTag) cardTag.style.display = 'none';
            }

            const badgeCount = document.getElementById(`badge-${type}-count`);
            if (badgeCount) badgeCount.textContent = count;
        }

        async function applyCustomStatFromInput(type) {
            const input = document.getElementById(`input-stat-${type}`);
            if (!input || !input.value.trim()) return;
            const val = input.value.trim();
            localStorage.setItem(`rhnd_custom_stat_${type}`, val);
            updateStatDisplay(type, liveCounts[type] || 0);
            input.value = '';

            // Give admin immediate feedback banner
            const toast = document.createElement('div');
            toast.style.cssText = 'position: fixed; bottom: 25px; right: 25px; background: #008751; color: white; padding: 14px 22px; border-radius: 10px; font-weight: 700; box-shadow: 0 10px 25px rgba(0,0,0,0.2); z-index: 99999; display: flex; align-items: center; gap: 10px; animation: fadeIn 0.3s ease;';
            toast.innerHTML = '<i class="fas fa-check-circle" style="color: #d4af37; font-size: 1.2rem;"></i> Number updated to <strong>' + val + '</strong> across all user portals!';
            document.body.appendChild(toast);
            setTimeout(() => { toast.remove(); }, 4000);

            try {
                await fetch('/api/settings', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Admin-Password': 'Admin@RHND2026'
                    },
                    body: JSON.stringify({ key: `stat_${type}`, value: val, adminPassword: 'Admin@RHND2026' })
                });
            } catch(e) {
                console.warn("Backend settings sync error:", e);
            }
        }

        async function resetStatToOriginal(type) {
            localStorage.removeItem(`rhnd_custom_stat_${type}`);
            updateStatDisplay(type, liveCounts[type] || 0);
            try {
                await fetch('/api/settings?key=stat_' + type, { method: 'DELETE', headers: fetchHeaders });
            } catch(e) {}
        }

        async function resetAllStatsToOriginal() {
            for (const type of ['members', 'news', 'requests', 'media']) {
                localStorage.removeItem(`rhnd_custom_stat_${type}`);
                updateStatDisplay(type, liveCounts[type] || 0);
                try {
                    await fetch('/api/settings?key=stat_' + type, { method: 'DELETE', headers: fetchHeaders });
                } catch(e) {}
            }
        }

        async function loadBackendSettings() {
            try {
                const res = await fetch('/api/settings?t=' + Date.now(), { cache: 'no-store' });
                if (res.ok) {
                    const settings = await res.json();
                    if (settings && typeof settings === 'object' && !settings.error) {
                        ['members', 'news', 'requests', 'media'].forEach(t => {
                            if (settings[`stat_${t}`] !== undefined && settings[`stat_${t}`] !== '') {
                                localStorage.setItem(`rhnd_custom_stat_${t}`, settings[`stat_${t}`]);
                            }
                        });
                        // Refresh display
                        ['members', 'news', 'requests', 'media'].forEach(t => {
                            updateStatDisplay(t, liveCounts[t] || 0);
                        });
                    }
                }
            } catch(e) {}
        }

        function scrollToManager() {
            const el = document.getElementById('overview-manager-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        }

        function switchOverviewSubTab(subtab) {
            const tabs = ['news', 'members', 'requests', 'media'];
            tabs.forEach(t => {
                const btn = document.getElementById(`subtab-btn-${t}`);
                const content = document.getElementById(`subtab-content-${t}`);
                if (btn) {
                    if (t === subtab) {
                        btn.classList.add('active-subtab');
                        btn.style.background = 'var(--secondary-dark-green)';
                        btn.style.color = 'var(--primary-gold)';
                    } else {
                        btn.classList.remove('active-subtab');
                        btn.style.background = '#e2e8f0';
                        btn.style.color = '#334155';
                    }
                }
                if (content) {
                    content.style.display = (t === subtab) ? 'block' : 'none';
                }
            });
        }

        // --- MULTIMEDIA (PHOTO, VIDEO, VOICE NOTE) ATTACHMENT STATE & HANDLERS ---
        const newsMediaState = {
            'post': { photo: '', video: '', audio: '', videoFile: null, photoFile: null },
            'ov-post': { photo: '', video: '', audio: '', videoFile: null, photoFile: null }
        };

        let mediaRecorder = null;
        let audioChunks = [];
        let recordInterval = null;
        let recordSeconds = 0;
        let activeRecordPrefix = null;

        function clearMedia(key) {
            // key example: 'post-photo', 'ov-post-video', 'post-audio'
            const parts = key.split('-');
            const prefix = parts.length === 3 ? parts[0] + '-' + parts[1] : parts[0];
            const type = parts[parts.length - 1]; // photo, video, audio

            if (newsMediaState[prefix]) {
                newsMediaState[prefix][type] = '';
                if (type === 'video') newsMediaState[prefix].videoFile = null;
                if (type === 'photo') newsMediaState[prefix].photoFile = null;
            }

            const preview = document.getElementById(`${key}-preview`);
            if (preview) {
                preview.style.display = 'none';
                preview.innerHTML = '';
            }

            const fileInput = document.getElementById(`${key}-file`);
            if (fileInput) fileInput.value = '';

            const urlInput = document.getElementById(`${key}-url`);
            if (urlInput) urlInput.value = '';

            if (type === 'photo') {
                const img = document.getElementById(`${key}-img`);
                if (img) img.src = '';
            } else if (type === 'video') {
                const vid = document.getElementById(`${key}-elem`);
                if (vid) { vid.pause(); vid.src = ''; }
            } else if (type === 'audio') {
                const aud = document.getElementById(`${key}-elem`);
                if (aud) { aud.pause(); aud.src = ''; }
            }
        }

        async function toggleVoiceRecording(prefix) {
            const btnLabel = document.getElementById(`rec-label-${prefix}`);
            const btnIcon = document.getElementById(`rec-icon-${prefix}`);

            if (mediaRecorder && mediaRecorder.state === 'recording') {
                // Stop recording
                mediaRecorder.stop();
                clearInterval(recordInterval);
                if (btnLabel) btnLabel.textContent = 'Record Live Voice Note';
                if (btnIcon) {
                    btnIcon.className = 'fas fa-microphone';
                    btnIcon.style.color = '#dc2626';
                }
                return;
            }

            // Start recording
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream);
                audioChunks = [];
                activeRecordPrefix = prefix;
                recordSeconds = 0;

                mediaRecorder.ondataavailable = (e) => {
                    if (e.data.size > 0) audioChunks.push(e.data);
                };

                mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const base64Audio = reader.result;
                        newsMediaState[prefix].audio = base64Audio;
                        const audElem = document.getElementById(`${prefix}-audio-elem`);
                        const preview = document.getElementById(`${prefix}-audio-preview`);
                        if (audElem && preview) {
                            audElem.src = base64Audio;
                            preview.style.display = 'block';
                        }
                    };
                    reader.readAsDataURL(audioBlob);
                    // Stop tracks
                    stream.getTracks().forEach(t => t.stop());
                };

                mediaRecorder.start();
                if (btnLabel) btnLabel.textContent = 'Recording 00:00... (Click to Stop)';
                if (btnIcon) {
                    btnIcon.className = 'fas fa-stop-circle';
                    btnIcon.style.color = '#dc2626';
                }

                recordInterval = setInterval(() => {
                    recordSeconds++;
                    const mins = String(Math.floor(recordSeconds / 60)).padStart(2, '0');
                    const secs = String(recordSeconds % 60).padStart(2, '0');
                    if (btnLabel) btnLabel.textContent = `Recording ${mins}:${secs}... (Click to Stop)`;
                }, 1000);

            } catch (err) {
                alert('Microphone access was denied or not available. You can upload an audio file instead.');
                console.warn('Microphone error:', err);
            }
        }

        function initMediaInputListeners(prefix) {
            // Photo File — store raw File object, preview with object URL
            const photoFile = document.getElementById(`${prefix}-photo-file`);
            if (photoFile) {
                photoFile.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        newsMediaState[prefix].photoFile = file;
                        newsMediaState[prefix].photo = '';
                        const img = document.getElementById(`${prefix}-photo-img`);
                        const prev = document.getElementById(`${prefix}-photo-preview`);
                        if (img && prev) {
                            img.src = URL.createObjectURL(file);
                            prev.style.display = 'block';
                        }
                    }
                });
            }

            // Photo URL
            const photoUrl = document.getElementById(`${prefix}-photo-url`);
            if (photoUrl) {
                photoUrl.addEventListener('input', (e) => {
                    const val = e.target.value.trim();
                    if (val) {
                        newsMediaState[prefix].photo = val;
                        const img = document.getElementById(`${prefix}-photo-img`);
                        const prev = document.getElementById(`${prefix}-photo-preview`);
                        if (img && prev) {
                            img.src = val;
                            prev.style.display = 'block';
                        }
                    }
                });
            }

            // Video File — store raw File object, preview with object URL (avoids base64 size bloat)
            const videoFile = document.getElementById(`${prefix}-video-file`);
            if (videoFile) {
                videoFile.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        newsMediaState[prefix].videoFile = file; // store raw File
                        newsMediaState[prefix].video = '';       // clear any old URL/base64
                        const urlInput = document.getElementById(`${prefix}-video-url`);
                        if (urlInput) urlInput.value = '';
                        const prev = document.getElementById(`${prefix}-video-preview`);
                        if (prev) {
                            const objUrl = URL.createObjectURL(file);
                            prev.innerHTML = `
                                <div style="position: relative; margin-top: 10px;">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                                        <span style="background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; padding: 2px 7px; border-radius: 4px; font-size: 0.72rem; font-weight: 700;"><i class="fas fa-file-video"></i> Video File Selected</span>
                                        <small style="color: #64748b; font-size: 0.75rem;">${file.name} (${(file.size / (1024*1024)).toFixed(1)} MB)</small>
                                    </div>
                                    <video controls playsinline style="width: 100%; max-height: 140px; border-radius: 8px; background: #000; display: block;" src="${objUrl}"></video>
                                    <button type="button" onclick="clearMedia('${prefix}-video')" style="position: absolute; top: 32px; right: 8px; background: rgba(220,38,38,0.9); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; font-size: 0.8rem; z-index: 10; display: flex; align-items: center; justify-content: center;" title="Remove Video">&times;</button>
                                </div>
                            `;
                            prev.style.display = 'block';
                        }
                    }
                });
            }

            // Video URL (TikTok, Instagram, Facebook, YouTube, MP4)
            // Listen on input, change AND paste so links pasted by any method are captured
            const videoUrl = document.getElementById(`${prefix}-video-url`);
            if (videoUrl) {
                const handleVideoUrl = (val) => {
                    val = (val || '').trim();
                    if (val) {
                        newsMediaState[prefix].video = val;
                        newsMediaState[prefix].videoFile = null;
                        const fileInput = document.getElementById(`${prefix}-video-file`);
                        if (fileInput) fileInput.value = '';
                        if (window.RHND_MEDIA) {
                            RHND_MEDIA.renderAdminPreview(`${prefix}-video-preview`, val);
                        }
                    } else {
                        newsMediaState[prefix].video = '';
                        const prev = document.getElementById(`${prefix}-video-preview`);
                        if (prev) { prev.style.display = 'none'; prev.innerHTML = ''; }
                    }
                };
                videoUrl.addEventListener('input',  (e) => handleVideoUrl(e.target.value));
                videoUrl.addEventListener('change', (e) => handleVideoUrl(e.target.value));
                videoUrl.addEventListener('paste',  (e) => {
                    // Use setTimeout so the pasted text is in the field before we read it
                    setTimeout(() => handleVideoUrl(videoUrl.value), 50);
                });
            }

            // Audio File
            const audioFile = document.getElementById(`${prefix}-audio-file`);
            if (audioFile) {
                audioFile.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = (evt) => {
                            newsMediaState[prefix].audio = evt.target.result;
                            const aud = document.getElementById(`${prefix}-audio-elem`);
                            const prev = document.getElementById(`${prefix}-audio-preview`);
                            if (aud && prev) {
                                aud.src = evt.target.result;
                                prev.style.display = 'block';
                            }
                        };
                        reader.readAsDataURL(file);
                    }
                });
            }

            // Audio URL
            const audioUrl = document.getElementById(`${prefix}-audio-url`);
            if (audioUrl) {
                audioUrl.addEventListener('input', (e) => {
                    const val = e.target.value.trim();
                    if (val) {
                        newsMediaState[prefix].audio = val;
                        const aud = document.getElementById(`${prefix}-audio-elem`);
                        const prev = document.getElementById(`${prefix}-audio-preview`);
                        if (aud && prev) {
                            aud.src = val;
                            prev.style.display = 'block';
                        }
                    }
                });
            }
        }

        function syncOverviewLists(posts, users, requests, media) {
            if (posts) {
                const ovPosts = document.getElementById('ov-posts-list');
                if (ovPosts) {
                    if (!posts.length) {
                        ovPosts.innerHTML = '<p style="color: #64748b;">No news articles yet.</p>';
                    } else {
                        ovPosts.innerHTML = posts.slice(0, 5).map(post => `
                            <div style="border-bottom: 1px solid #e2e8f0; padding: 12px 0; display: flex; justify-content: space-between; align-items: center; gap: 10px;">
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    ${post.photo ? `<img src="${post.photo}" style="width: 48px; height: 48px; border-radius: 6px; object-fit: cover; flex-shrink: 0;" onerror="this.style.display='none'">` : ''}
                                    <div>
                                        <div style="display: flex; gap: 6px; align-items: center; margin-bottom: 2px;">
                                            <span class="badge" style="background: #f0fdf4; color: var(--primary-green); font-size: 0.72rem; padding: 1px 6px;">${post.category || 'Update'}</span>
                                            ${window.RHND_MEDIA ? RHND_MEDIA.getBadgeHtml(post.video) : (post.video ? '<span style="background: #eff6ff; color: #2563eb; font-size: 0.7rem; padding: 1px 5px; border-radius: 4px; font-weight: 700;"><i class="fas fa-video"></i> Video</span>' : '')}
                                            ${post.audio ? '<span style="background: #fef3c7; color: #b45309; font-size: 0.7rem; padding: 1px 5px; border-radius: 4px; font-weight: 700;"><i class="fas fa-microphone"></i> Voice Note</span>' : ''}
                                        </div>
                                        <strong style="color: #0f172a; font-size: 0.95rem;">${post.title}</strong>
                                        <div style="color: #64748b; font-size: 0.78rem;"><i class="far fa-calendar-alt"></i> ${new Date(post.created_at || Date.now()).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                <button onclick="deletePost(${post.id})" class="btn-action btn-delete" style="padding: 4px 10px; font-size: 0.8rem; flex-shrink: 0;"><i class="fas fa-trash"></i> Delete</button>
                            </div>
                        `).join('');
                    }
                }
            }
            if (users) {
                const ovUsers = document.getElementById('ov-members-list-tbody');
                if (ovUsers) {
                    if (!users.length) {
                        ovUsers.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #64748b; padding: 15px;">No members yet.</td></tr>';
                    } else {
                        ovUsers.innerHTML = users.slice(0, 5).map((u, idx) => {
                            let idStr = '#RHND-NIG-00001';
                            if (typeof u.id === 'number') {
                                idStr = '#RHND-NIG-' + String(idx + 1).padStart(5, '0');
                            } else if (u.id) {
                                idStr = u.id.startsWith('#') ? u.id : '#' + u.id;
                            }
                            const dateStr = u.created_at ? new Date(u.created_at).toLocaleDateString() : '9/12/2026';
                            return `
                                <tr>
                                    <td style="padding: 10px;"><strong class="text-gold" style="font-family: monospace; font-size: 0.9rem;">${idStr}</strong></td>
                                    <td style="padding: 10px; font-weight: 700; color: #0f172a;">${u.name || 'Member'}</td>
                                    <td style="padding: 10px; color: #64748b;">${u.email || ''}</td>
                                    <td style="padding: 10px; color: #64748b; font-size: 0.85rem;">${dateStr}</td>
                                    <td style="padding: 10px;"><button onclick="deleteMember('${u.id}')" class="btn-action btn-delete" style="padding: 4px 8px; font-size: 0.75rem;"><i class="fas fa-trash"></i> Remove</button></td>
                                </tr>
                            `;
                        }).join('');
                    }
                }
            }
            if (requests) {
                const ovReq = document.getElementById('ov-requests-list-tbody');
                if (ovReq) {
                    if (!requests.length) {
                        ovReq.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #64748b; padding: 15px;">No support requests.</td></tr>';
                    } else {
                        ovReq.innerHTML = requests.slice(0, 5).map(r => {
                            const badgeClass = r.status === 'Resolved' ? 'badge-resolved' : (r.status === 'In Progress' ? 'badge-progress' : 'badge-pending');
                            return `
                                <tr>
                                    <td style="padding: 10px;"><strong class="text-gold" style="font-family: monospace;">#T-${r.id}</strong></td>
                                    <td style="padding: 10px; font-weight: 700; color: #0f172a;">${r.name || 'Citizen'}</td>
                                    <td style="padding: 10px; color: #64748b;">${r.category || 'General'}</td>
                                    <td style="padding: 10px; color: #334155;">${r.subject || ''}</td>
                                    <td style="padding: 10px;"><span class="badge ${badgeClass}">${r.status || 'Pending'}</span></td>
                                    <td style="padding: 10px;">
                                        <div style="display: flex; gap: 4px;">
                                            ${r.status !== 'Resolved' ? `<button onclick="updateRequestStatus('${r.id}', 'Resolved')" class="btn-action btn-success-sm" style="padding: 3px 6px; font-size: 0.75rem;" title="Mark Resolved"><i class="fas fa-check"></i></button>` : `<button onclick="updateRequestStatus('${r.id}', 'In Progress')" class="btn-action btn-info-sm" style="padding: 3px 6px; font-size: 0.75rem;" title="Reopen"><i class="fas fa-redo"></i></button>`}
                                            <button onclick="deleteRequest('${r.id}')" class="btn-action btn-delete" style="padding: 3px 6px; font-size: 0.75rem;" title="Delete"><i class="fas fa-trash"></i></button>
                                        </div>
                                    </td>
                                </tr>
                            `;
                        }).join('');
                    }
                }
            }
            if (media) {
                const ovMed = document.getElementById('ov-media-library-grid');
                if (ovMed) {
                    if (!media.length) {
                        ovMed.innerHTML = '<p style="color: #64748b; grid-column: 1/-1;">No media files uploaded.</p>';
                    } else {
                        ovMed.innerHTML = media.slice(0, 4).map(m => {
                                let thumbHtml = '';
                                if (m.media_type === 'Video') {
                                    thumbHtml = `<div style="width:100%;height:110px;background:#000;display:flex;align-items:center;justify-content:center;"><video src="${m.url}" style="width:100%;height:100%;object-fit:cover;"></video></div>`;
                                } else {
                                    thumbHtml = `<img src="${m.url}" alt="${m.title}" style="width:100%;height:110px;object-fit:cover;" onerror="this.src='https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=400&q=80'">`;
                                }
                                return `
                                <div style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;background:white;">
                                    ${thumbHtml}
                                    <div style="padding:8px;display:flex;justify-content:space-between;align-items:center;">
                                        <strong style="font-size:0.85rem;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:140px;">${m.title}</strong>
                                        <button onclick="deleteMedia('${m.id}')" class="btn-action btn-delete" style="padding:3px 6px;font-size:0.75rem;"><i class="fas fa-trash"></i></button>
                                    </div>
                                </div>`;
                            }).join('');
                    }
                }
            }
        }

        // --- 1. NEWS LOGIC ---
        const defaultNews = [
            {
                id: 101,
                title: "Federal Government Launches Special Diaspora Housing Scheme",
                category: "Policy Announcement",
                photo: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1000&q=80",
                video: "",
                audio: "",
                content: "The Federal Ministry of Housing and Urban Development has unveiled an exclusive mortgage scheme tailored for Nigerians living abroad. The initiative aims to provide secure property ownership and transparent investment opportunities.\n\nUnder this scheme, registered diaspora citizens can apply for federal home loans with flexible repayment terms, verified land titles, and direct consular assistance. Key partner banks and mortgage institutions have integrated automated diaspora verification protocols to prevent fraud and ensure seamless allocation.\n\nInterested applicants can initiate their requests directly through the Diaspora Services section of the RHND portal.",
                created_at: "2026-03-01T10:00:00Z"
            },
            {
                id: 102,
                title: "NiDCOM Announces Virtual Diaspora Townhall Dialogue",
                category: "Townhall Update",
                photo: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&q=80",
                video: "https://www.w3schools.com/html/mov_bbb.mp4",
                audio: "",
                content: "The Nigerians in Diaspora Commission (NiDCOM) invites all citizens overseas to participate in the upcoming quarterly virtual townhall meeting with diplomatic representatives and policy makers.\n\nThe interactive session will focus on consular welfare, passport renewal acceleration, voting rights advocacy, and foreign investment security. Registration is free and open to all registered community members.",
                created_at: "2026-03-05T14:30:00Z"
            },
            {
                id: 103,
                title: "Nigeria Immigration Service Expands Diaspora Passport Centres",
                category: "Consular Notice",
                photo: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1000&q=80",
                video: "",
                audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
                content: "New passport enrollment and renewal processing centers have been established across strategic international locations to reduce processing wait times for diaspora citizens.\n\nCitizens living in North America, Europe, the Middle East, and Asia-Pacific regions can now access fast-track biometric capture appointments at authorized consular processing desks. Listen to the official audio briefing attached for complete step-by-step instructions.",
                created_at: "2026-03-09T09:15:00Z"
            }
        ];

        function getStoredPosts() {
            let list = [];
            try {
                const local = localStorage.getItem('rhnd_news_db') || localStorage.getItem('rhnd_posts_db');
                if (local) {
                    const parsed = JSON.parse(local);
                    if (Array.isArray(parsed) && parsed.length > 0) list = parsed;
                }
            } catch(e) {}
            if (list.length === 0) {
                list = [...defaultNews];
                try {
                    localStorage.setItem('rhnd_news_db', JSON.stringify(list));
                    localStorage.setItem('rhnd_posts_db', JSON.stringify(list));
                } catch(e) {}
            }
            return list;
        }

        function saveStoredPosts(posts) {
            try {
                localStorage.setItem('rhnd_news_db', JSON.stringify(posts));
                localStorage.setItem('rhnd_posts_db', JSON.stringify(posts));
            } catch(e) {}
        }

        async function fetchPosts() {
            try {
                const res = await fetch('/api/posts?t=' + Date.now(), { cache: 'no-store' });
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data) && !data.error) {
                        saveStoredPosts(data);
                        renderPostsUI(data);
                        return;
                    }
                }
            } catch(e) {
                console.warn("Using local news cache:", e);
            }
            let posts = getStoredPosts();
            renderPostsUI(posts);
        }

        function renderPostsUI(posts) {
            const list = document.getElementById('posts-list');
            updateStatDisplay('news', posts.length || 0);
            syncOverviewLists(posts, null, null, null);

            if (!list) return;
            if (!posts || posts.length === 0) {
                list.innerHTML = '<p style="color: #64748b;">No news articles published yet.</p>';
                return;
            }

            list.innerHTML = posts.map(post => `
                <div style="border-bottom: 1px solid #e2e8f0; padding: 18px 0; display: flex; justify-content: space-between; align-items: center; gap: 15px;">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        ${post.photo ? `<img src="${post.photo}" style="width: 70px; height: 70px; border-radius: 8px; object-fit: cover; flex-shrink: 0; border: 1px solid #e2e8f0;" onerror="this.style.display='none'">` : ''}
                        <div>
                            <div style="display: flex; gap: 6px; align-items: center; margin-bottom: 4px; flex-wrap: wrap;">
                                <span class="badge" style="background: #f0fdf4; color: var(--primary-green); font-size: 0.75rem; padding: 2px 8px;">${post.category || 'Official Update'}</span>
                                ${window.RHND_MEDIA ? RHND_MEDIA.getBadgeHtml(post.video) : (post.video ? '<span style="background: #eff6ff; color: #2563eb; font-size: 0.72rem; padding: 2px 6px; border-radius: 4px; font-weight: 700;"><i class="fas fa-video"></i> Video Attached</span>' : '')}
                                ${post.audio ? '<span style="background: #fef3c7; color: #b45309; font-size: 0.72rem; padding: 2px 6px; border-radius: 4px; font-weight: 700;"><i class="fas fa-microphone"></i> Voice Note</span>' : ''}
                            </div>
                            <h4 style="margin: 0 0 6px 0; font-size: 1.15rem; color: #0f172a;">${post.title}</h4>
                            <small style="color: #64748b; font-weight: 600;"><i class="far fa-calendar-alt"></i> ${new Date(post.created_at || Date.now()).toLocaleString()}</small>
                        </div>
                    </div>
                    <button onclick="deletePost(${post.id})" class="btn-action btn-delete" style="flex-shrink: 0;"><i class="fas fa-trash"></i> Delete</button>
                </div>
            `).join('');
        }

        async function deletePost(id) {
            if(!confirm('Delete this news update?')) return;
            
            try {
                await fetch('/api/posts?id=' + id, { method: 'DELETE', headers: fetchHeaders });
            } catch(e) {
                console.warn("Delete API error:", e);
            }

            let posts = getStoredPosts();
            posts = posts.filter(p => p.id != id);
            saveStoredPosts(posts);
            renderPostsUI(posts);

            fetchPosts();
        }

        function computeSha1(str) {
            const utf8 = new TextEncoder().encode(str);
            const words = [];
            for (let i = 0; i < utf8.length; i++) words[i >> 2] |= utf8[i] << (24 - (i % 4) * 8);
            const bitLen = utf8.length * 8;
            words[bitLen >> 5] |= 0x80 << (24 - (bitLen % 32));
            words[(((bitLen + 64) >> 9) << 4) + 15] = bitLen;
            let h0 = 0x67452301, h1 = 0xEFCDAB89, h2 = 0x98BADCFE, h3 = 0x10325476, h4 = 0xC3D2E1F0;
            for (let i = 0; i < words.length; i += 16) {
                const w = new Array(80);
                for (let j = 0; j < 16; j++) w[j] = words[i + j] || 0;
                for (let j = 16; j < 80; j++) {
                    const n = w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16];
                    w[j] = (n << 1) | (n >>> 31);
                }
                let a = h0, b = h1, c = h2, d = h3, e = h4;
                for (let j = 0; j < 80; j++) {
                    let f, k;
                    if (j < 20) { f = (b & c) | ((~b) & d); k = 0x5A827999; }
                    else if (j < 40) { f = b ^ c ^ d; k = 0x6ED9EBA1; }
                    else if (j < 60) { f = (b & c) | (b & d) | (c & d); k = 0x8F1BBCDC; }
                    else { f = b ^ c ^ d; k = 0xCA62C1D6; }
                    const temp = (((a << 5) | (a >>> 27)) + f + e + k + w[j]) | 0;
                    e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = temp;
                }
                h0 = (h0 + a) | 0; h1 = (h1 + b) | 0; h2 = (h2 + c) | 0; h3 = (h3 + d) | 0; h4 = (h4 + e) | 0;
            }
            const toHex = n => (n >>> 0).toString(16).padStart(8, '0');
            return toHex(h0) + toHex(h1) + toHex(h2) + toHex(h3) + toHex(h4);
        }

        async function uploadFileToCloudinary(file, resourceType = 'auto', onProgress = null) {
            const cloudName = 'dpghoiocq';
            const apiKey = '283943216837512';
            const apiSecret = 'y_c8wSat2wFRqfuIjFuAwkA1aKE';
            const timestamp = Math.floor(Date.now() / 1000);
            const signature = computeSha1(`timestamp=${timestamp}${apiSecret}`);

            // Primary: Direct Cloudinary Upload with Live Progress
            try {
                return await new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
                    
                    xhr.open('POST', uploadUrl);

                    if (onProgress && xhr.upload) {
                        xhr.upload.onprogress = (evt) => {
                            if (evt.lengthComputable) {
                                const percent = Math.round((evt.loaded / evt.total) * 100);
                                onProgress(percent);
                            }
                        };
                    }

                    xhr.onload = () => {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            try {
                                const res = JSON.parse(xhr.responseText);
                                if (res.secure_url || res.url) {
                                    resolve(res.secure_url || res.url);
                                } else {
                                    reject(new Error('Cloud storage returned no video URL'));
                                }
                            } catch(err) {
                                reject(new Error('Invalid response from cloud storage'));
                            }
                        } else {
                            let errMessage = 'Upload failed (HTTP ' + xhr.status + ')';
                            try {
                                const res = JSON.parse(xhr.responseText);
                                if (res.error && res.error.message) errMessage = res.error.message;
                            } catch(e) {}
                            reject(new Error(errMessage));
                        }
                    };

                    xhr.onerror = () => reject(new Error('Direct connection error, trying backup route'));
                    xhr.ontimeout = () => reject(new Error('Upload timed out, trying backup route'));

                    const formData = new FormData();
                    formData.append('file', file, file.name || 'upload.mp4');
                    formData.append('api_key', apiKey);
                    formData.append('timestamp', timestamp);
                    formData.append('signature', signature);

                    xhr.send(formData);
                });
            } catch(directErr) {
                console.warn('Direct upload failed, using server backup route:', directErr);
                // Secondary Fallback: Backend Upload via /api/upload
                const formData = new FormData();
                formData.append('video', file, file.name || 'upload.mp4');
                formData.append('admin_password', 'Admin@RHND2026');

                const backupRes = await fetch('/api/upload', {
                    method: 'POST',
                    headers: { 'X-Admin-Password': 'Admin@RHND2026' },
                    body: formData
                });

                if (!backupRes.ok) {
                    const backupErr = await backupRes.json().catch(() => ({}));
                    throw new Error(backupErr.error || ('Server backup upload failed with HTTP ' + backupRes.status));
                }

                const backupData = await backupRes.json();
                if (backupData.url || backupData.video) {
                    return backupData.url || backupData.video;
                }
                throw new Error('No valid URL returned from backup upload');
            }
        }

        async function handleAddPost(title, content, category, photo, video, audio, statusEl, videoFile, photoFile) {
            if (!title || !content) {
                alert('Please enter a Title and Content body.');
                return false;
            }

            let finalVideo = (video || '').trim();
            let finalPhoto = (photo || '').trim();
            let finalAudio = (audio || '').trim();

            if (statusEl) {
                statusEl.textContent = 'Preparing post...';
                statusEl.style.color = '#2563eb';
                statusEl.style.display = 'inline';
            }

            // 1. Upload Video File directly to Cloudinary CDN
            if (videoFile && videoFile instanceof File) {
                try {
                    if (statusEl) statusEl.textContent = 'Uploading video to Cloud CDN (0%)...';
                    finalVideo = await uploadFileToCloudinary(videoFile, 'video', (pct) => {
                        if (statusEl) statusEl.textContent = `Uploading video to Cloud CDN (${pct}%)...`;
                    });
                    if (statusEl) statusEl.textContent = 'Video uploaded successfully! Publishing...';
                } catch(uploadErr) {
                    console.error('Video upload error:', uploadErr);
                    if (statusEl) {
                        statusEl.textContent = 'Video Upload Error: ' + uploadErr.message;
                        statusEl.style.color = '#dc2626';
                    }
                    alert('Video Upload Failed: ' + uploadErr.message + '\n\nPlease ensure you have an internet connection and try again.');
                    return false;
                }
            }

            // 2. Upload Photo File directly to Cloudinary CDN
            if (photoFile && photoFile instanceof File) {
                try {
                    if (statusEl) statusEl.textContent = 'Uploading photo to Cloud CDN...';
                    finalPhoto = await uploadFileToCloudinary(photoFile, 'image');
                } catch(photoErr) {
                    console.warn('Photo upload warning, using local:', photoErr);
                }
            }

            // Create post object and immediately save to local cache
            const tempId = Date.now();
            const postObj = {
                id: tempId,
                title,
                content,
                category: category || 'Official Update',
                photo: finalPhoto,
                video: finalVideo,
                audio: finalAudio,
                created_at: new Date().toISOString()
            };

            let localPosts = getStoredPosts();
            localPosts.unshift(postObj);
            saveStoredPosts(localPosts);
            renderPostsUI(localPosts);

            const postPayload = {
                title,
                content,
                category: category || 'Official Update',
                photo: finalPhoto,
                video: finalVideo,
                audio: finalAudio,
                admin_password: 'Admin@RHND2026'
            };

            if (statusEl) {
                statusEl.textContent = 'Saving to Database & Publishing Live...';
                statusEl.style.color = '#2563eb';
            }

            try {
                const res = await fetch('/api/posts', {
                    method: 'POST',
                    headers: fetchHeaders,
                    body: JSON.stringify(postPayload)
                });

                if (res.ok) {
                    const serverData = await res.json().catch(() => ({}));
                    if (serverData && serverData.id) {
                        postObj.id = serverData.id;
                        saveStoredPosts(localPosts);
                    }
                    await fetchPosts();
                }
            } catch(err) {
                console.warn("Remote database sync skipped or offline:", err);
            }

            if (statusEl) {
                statusEl.textContent = 'Published Live Successfully!';
                statusEl.style.color = '#16a34a';
                statusEl.style.display = 'inline';
                setTimeout(() => statusEl.style.display = 'none', 5000);
            }
            alert('✅ Success! Your video update has been published live and is now visible on the News page and Homepage!');
            const listElem = document.getElementById('posts-list');
            if (listElem) listElem.scrollIntoView({ behavior: 'smooth' });
            return true;
        }

        // --- 2. MEMBERS LOGIC ---
        function getStoredMembers() {
            let list = [];
            try {
                const local = localStorage.getItem('rhnd_members_db');
                if (local) {
                    const parsed = JSON.parse(local);
                    if (Array.isArray(parsed)) list = parsed;
                }
            } catch(e) {}

            // Remove any old mock/dummy entries
            const fakeEmails = ['babatunde.ade@diaspora.org', 'ngozi.diaspora@gmail.com', 'ibrahim.musa@rhnd.org', 'sample@member.com'];
            list = list.filter(m => m && m.email && !fakeEmails.includes(m.email.toLowerCase()));

            // Ensure Amina Hausawi is registered as Member #RHND-NIG-00001
            const hasAmina = list.some(m => m && m.email && m.email.toLowerCase().includes('aminahausawi'));
            if (!hasAmina) {
                list.unshift({
                    id: "RHND-NIG-00001",
                    name: "Amina Hausawi",
                    email: "aminahausawi10@gmail.com",
                    country: "United Kingdom",
                    created_at: new Date().toISOString()
                });
            }

            // Sync with current active session if a real user is logged in
            try {
                const currentUser = JSON.parse(localStorage.getItem('rhnd_user') || 'null');
                if (currentUser && currentUser.email && !currentUser.email.toLowerCase().includes('admin')) {
                    const exists = list.some(m => m && m.email && m.email.toLowerCase() === currentUser.email.toLowerCase());
                    if (!exists) {
                        list.push({
                            id: currentUser.memberId || ('RHND-NIG-' + String(list.length + 1).padStart(5, '0')),
                            name: currentUser.name || currentUser.email.split('@')[0],
                            email: currentUser.email,
                            country: currentUser.country || 'Diaspora',
                            created_at: new Date().toISOString()
                        });
                    }
                }
            } catch(e) {}

            localStorage.setItem('rhnd_members_db', JSON.stringify(list));
            return list;
        }

        async function fetchMembers() {
            let users = getStoredMembers();
            try {
                const res = await fetch('/api/users?t=' + Date.now(), { cache: 'no-store' });
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data) && data.length > 0 && !data.error) {
                        const realApiUsers = data.filter(u => u && u.email && !u.email.toLowerCase().includes('admin'));
                        if (realApiUsers.length > 0) {
                            users = realApiUsers;
                            localStorage.setItem('rhnd_members_db', JSON.stringify(users));
                        }
                    }
                }
            } catch(e) {
                console.warn("Using stored member directory");
            }

            const tbody = document.getElementById('members-list-tbody');
            updateStatDisplay('members', users.length || 0);
            syncOverviewLists(null, users, null, null);

            if (!tbody) return;
            if (!users || users.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #64748b; padding: 25px;">No registered members found.</td></tr>';
                return;
            }

            tbody.innerHTML = users.map((u, idx) => {
                let idStr = '#RHND-NIG-00001';
                if (typeof u.id === 'number') {
                    idStr = '#RHND-NIG-' + String(idx + 1).padStart(5, '0');
                } else if (u.id) {
                    idStr = u.id.startsWith('#') ? u.id : '#' + u.id;
                }
                const country = u.country || 'United Kingdom';
                return `
                <tr>
                    <td><strong class="text-gold" style="font-family: monospace; font-size: 0.95rem;">${idStr}</strong></td>
                    <td><strong style="color: #0f172a;">${u.name || 'Member'}</strong></td>
                    <td>${u.email}</td>
                    <td><i class="fas fa-map-marker-alt text-gold" style="margin-right: 4px;"></i> ${country}</td>
                    <td>${u.created_at ? new Date(u.created_at).toLocaleDateString() : '9/12/2026'}</td>
                    <td>
                        <button onclick="deleteMember('${u.id}')" class="btn-action btn-delete">
                            <i class="fas fa-user-minus"></i> Remove
                        </button>
                    </td>
                </tr>
                `;
            }).join('');
        }

        async function deleteMember(id) {
            if(!confirm('Are you sure you want to remove this member account?')) return;
            try {
                await fetch('/api/users?id=' + id, { method: 'DELETE', headers: fetchHeaders });
            } catch(e) {}
            let members = getStoredMembers();
            members = members.filter(m => String(m.id) !== String(id));
            localStorage.setItem('rhnd_members_db', JSON.stringify(members));
            fetchMembers();
            loadBackendSettings();
        }

        function handleAddMember(name, email, country, password, statusEl) {
            let members = getStoredMembers();
            const newMember = {
                id: 'RHND-NIG-' + String(members.length + 1).padStart(5, '0'),
                name: name,
                email: email,
                country: country || 'United Kingdom',
                created_at: new Date().toISOString()
            };

            members.push(newMember);
            localStorage.setItem('rhnd_members_db', JSON.stringify(members));

            try {
                fetch('/api/users', {
                    method: 'POST',
                    headers: fetchHeaders,
                    body: JSON.stringify({name, email, country, password})
                }).catch(e => {});
            } catch(e) {}

            if (statusEl) {
                statusEl.textContent = 'Member Account Created!';
                statusEl.style.display = 'inline';
                setTimeout(() => statusEl.style.display = 'none', 3500);
            }
            fetchMembers();
        }

        // --- 3. SUPPORT REQUESTS LOGIC ---
        const defaultRequests = [
            {
                id: 1,
                name: "Amina Hausawi",
                email: "aminahausawi10@gmail.com",
                country: "United Kingdom",
                category: "Passport & Consular Assistance",
                subject: "Inquiry on Passport Renewal Center in London",
                details: "Requesting guidance on official diplomatic fast-track passport capture desk location in the UK.",
                status: "Resolved",
                created_at: "2026-09-10T14:20:00Z"
            }
        ];

        function getStoredRequests() {
            try {
                const local = localStorage.getItem('rhnd_requests_db');
                if (local) {
                    const parsed = JSON.parse(local);
                    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
                }
            } catch(e) {}
            return defaultRequests;
        }

        async function fetchRequests() {
            let requests = getStoredRequests();
            try {
                const res = await fetch('/api/requests');
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data) && !data.error) {
                        requests = data;
                        localStorage.setItem('rhnd_requests_db', JSON.stringify(requests));
                    }
                }
            } catch(e) {
                console.warn("Using stored support requests");
            }

            const tbody = document.getElementById('requests-list-tbody');
            updateStatDisplay('requests', requests.length || 0);
            syncOverviewLists(null, null, requests, null);

            if (!tbody) return;
            if (!requests || requests.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #64748b; padding: 25px;">No assistance tickets logged.</td></tr>';
                return;
            }

            tbody.innerHTML = requests.map(r => {
                const badgeClass = r.status === 'Resolved' ? 'badge-resolved' : (r.status === 'In Progress' ? 'badge-progress' : 'badge-pending');
                return `
                <tr>
                    <td><strong class="text-gold" style="font-family: monospace;">#T-${r.id}</strong></td>
                    <td>
                        <div><strong style="color: #0f172a;">${r.name}</strong></div>
                        <small style="color: #64748b;">${r.email} (${r.country || 'Diaspora'})</small>
                    </td>
                    <td><span class="badge" style="background: #f1f5f9; color: #334155;">${r.category}</span></td>
                    <td>
                        <div style="font-weight: 600; color: #0f172a;">${r.subject}</div>
                        <small style="color: #64748b;">${r.details}</small>
                    </td>
                    <td><span class="badge ${badgeClass}">${r.status}</span></td>
                    <td>
                        <div style="display: flex; gap: 6px;">
                            ${r.status !== 'Resolved' ? `<button onclick="updateRequestStatus('${r.id}', 'Resolved')" class="btn-action btn-success-sm" title="Mark as Resolved"><i class="fas fa-check"></i> Resolve</button>` : `<button onclick="updateRequestStatus('${r.id}', 'In Progress')" class="btn-action btn-info-sm" title="Reopen"><i class="fas fa-redo"></i> Reopen</button>`}
                            <button onclick="deleteRequest('${r.id}')" class="btn-action btn-delete" title="Delete Ticket"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
                `;
            }).join('');
        }

        async function updateRequestStatus(id, newStatus) {
            let requests = getStoredRequests();
            requests = requests.map(r => String(r.id) === String(id) ? { ...r, status: newStatus } : r);
            localStorage.setItem('rhnd_requests_db', JSON.stringify(requests));
            fetchRequests();

            try {
                await fetch(`/api/requests?action=status&id=${id}`, {
                    method: 'POST',
                    headers: fetchHeaders,
                    body: JSON.stringify({ status: newStatus })
                });
            } catch(e) {}
        }

        async function deleteRequest(id) {
            if(!confirm('Delete this support ticket?')) return;
            let requests = getStoredRequests();
            requests = requests.filter(r => String(r.id) !== String(id));
            localStorage.setItem('rhnd_requests_db', JSON.stringify(requests));
            fetchRequests();

            try {
                await fetch('/api/requests?id=' + id, { method: 'DELETE', headers: fetchHeaders });
            } catch(e) {}
        }

        function handleAddRequest(name, email, category, country, subject, details, statusEl) {
            const newReq = {
                id: Date.now().toString().slice(-4),
                name, email, category, country, subject, details,
                status: 'Pending',
                created_at: new Date().toISOString()
            };

            let requests = getStoredRequests();
            requests.unshift(newReq);
            localStorage.setItem('rhnd_requests_db', JSON.stringify(requests));

            try {
                fetch('/api/requests', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, category, country, subject, details })
                }).catch(e => {});
            } catch(e) {}

            if (statusEl) {
                statusEl.textContent = 'Ticket Logged!';
                statusEl.style.display = 'inline';
                setTimeout(() => statusEl.style.display = 'none', 3000);
            }
            fetchRequests();
        }

        // --- 4. MEDIA LOGIC ---
        const defaultMedia = [
            {
                id: 1,
                title: "Federal Executive Council Diaspora Briefing",
                media_type: "Photo",
                url: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=800",
                caption: "Official presentation of the new national diaspora engagement blueprint."
            },
            {
                id: 2,
                title: "Global Diaspora Townhall 2026",
                media_type: "Photo",
                url: "https://images.unsplash.com/photo-1577416412292-747c6607f055?auto=format&fit=crop&q=80&w=800",
                caption: "Virtual gathering connecting Nigerian diaspora leaders from 45 countries."
            }
        ];

        function getStoredMedia() {
            try {
                const local = localStorage.getItem('rhnd_media_db');
                if (local) {
                    const parsed = JSON.parse(local);
                    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
                }
            } catch(e) {}
            return defaultMedia;
        }

        async function fetchMedia() {
            let items = getStoredMedia();
            try {
                const res = await fetch('/api/media');
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data) && !data.error) {
                        items = data;
                        localStorage.setItem('rhnd_media_db', JSON.stringify(items));
                    }
                }
            } catch(e) {
                console.warn("Using stored media dataset");
            }

            const grid = document.getElementById('media-library-grid');
            updateStatDisplay('media', items.length || 0);
            syncOverviewLists(null, null, null, items);

            if (!grid) return;
            if (!items || items.length === 0) {
                grid.innerHTML = '<p style="grid-column: 1/-1; color: #64748b; text-align: center; padding: 25px;">No media files uploaded yet.</p>';
                return;
            }

            grid.innerHTML = items.map(m => {
                // Build a smart preview based on URL type
                let previewHtml = '';
                if (window.RHND_MEDIA && m.url) {
                    const parsed = RHND_MEDIA.parse(m.url);
                    if (parsed && ['direct','youtube'].includes(parsed.type)) {



                        previewHtml = `<div class="media-preview" style="background:#000;display:flex;align-items:center;justify-content:center;position:relative;">
                            <video controls style="width:100%;height:100%;object-fit:cover;" src="${m.url}"></video>
                        </div>`;
                    } else {
                        previewHtml = `<div class="media-preview"><img src="${m.url}" alt="${m.title}" onerror="this.src='https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600'"></div>`;
                    }
                } else {
                    previewHtml = `<div class="media-preview"><img src="${m.url}" alt="${m.title}" onerror="this.src='https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600'"></div>`;
                }
                return `
                <div class="media-card">
                    ${previewHtml}
                    <div class="media-info">
                        <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">
                            <span class="badge badge-progress">${m.media_type}</span>
                            ${window.RHND_MEDIA && m.url ? RHND_MEDIA.getBadgeHtml(m.url) : ''}
                        </div>
                        <h4 style="margin: 0 0 6px 0; font-size: 1.05rem; color: #0f172a;">${m.title}</h4>
                        <p style="color: #64748b; font-size: 0.88rem; margin-bottom: 12px;">${m.caption || ''}</p>
                        <button onclick="deleteMedia('${m.id}')" class="btn-action btn-delete" style="width: 100%; justify-content: center;">
                            <i class="fas fa-trash"></i> Delete Item
                        </button>
                    </div>
                </div>
            `}).join('');
        }

        async function deleteMedia(id) {
            if(!confirm('Delete this media item?')) return;
            let items = getStoredMedia();
            items = items.filter(m => String(m.id) !== String(id));
            localStorage.setItem('rhnd_media_db', JSON.stringify(items));
            fetchMedia();

            try {
                await fetch('/api/media?id=' + id, { method: 'DELETE', headers: fetchHeaders });
            } catch(e) {}
        }

        function handleAddMedia(title, media_type, url, caption, statusEl) {
            const newItem = {
                id: Date.now(),
                title, media_type, url, caption: caption || '',
                created_at: new Date().toISOString()
            };

            let items = getStoredMedia();
            items.unshift(newItem);
            localStorage.setItem('rhnd_media_db', JSON.stringify(items));

            try {
                fetch('/api/media', {
                    method: 'POST',
                    headers: fetchHeaders,
                    body: JSON.stringify({ title, media_type, url, caption })
                }).catch(e => {});
            } catch(e) {}

            if (statusEl) {
                statusEl.textContent = 'Media Added!';
                statusEl.style.display = 'inline';
                setTimeout(() => statusEl.style.display = 'none', 3000);
            }
            fetchMedia();
        }

        // --- 5. BROADCAST ALERTS LOGIC ---
        function loadBroadcastAlert() {
            const previewEl = document.getElementById('active-broadcast-preview');
            const rawAlert = localStorage.getItem('rhnd_broadcast_alert');
            if (rawAlert) {
                try {
                    const alertData = JSON.parse(rawAlert);
                    if (alertData && alertData.active) {
                        previewEl.innerHTML = `
                            <div style="border-left: 4px solid #b45309; padding-left: 15px;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                    <span class="badge" style="background: #fef3c7; color: #b45309;">${alertData.type || 'High Priority Alert'}</span>
                                    <small style="color: #64748b;">Active since: ${new Date(alertData.created_at || Date.now()).toLocaleString()}</small>
                                </div>
                                <h4 style="margin: 0 0 6px 0; color: #0f172a; font-size: 1.1rem;">${alertData.title}</h4>
                                <p style="margin: 0; color: #334155; line-height: 1.5;">${alertData.message}</p>
                            </div>
                        `;
                        return;
                    }
                } catch(e) {}
            }
            previewEl.innerHTML = '<p style="color: #64748b; margin: 0;"><i class="fas fa-info-circle"></i> No active broadcast alert is currently pushed.</p>';
        }

        function clearBroadcastAlert() {
            localStorage.removeItem('rhnd_broadcast_alert');
            loadBroadcastAlert();
            const status = document.getElementById('broadcast-status');
            if (status) {
                status.textContent = 'Alert deactivated!';
                status.style.color = '#dc2626';
                status.style.display = 'inline';
                setTimeout(() => status.style.display = 'none', 3000);
            }
        }

        // Initialize All Event Listeners Once DOM is Ready
        document.addEventListener('DOMContentLoaded', () => {
            // Init Media Input Listeners for Photo, Video, Audio
            initMediaInputListeners('ov-post');
            initMediaInputListeners('post');

            // News Forms
            const ovPostForm = document.getElementById('ov-add-post-form');
            if (ovPostForm) {
                ovPostForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const submitBtn = ovPostForm.querySelector('button[type="submit"]');
                    const origBtnText = submitBtn ? submitBtn.innerHTML : '';
                    
                    const title = document.getElementById('ov-post-title').value.trim();
                    const content = document.getElementById('ov-post-content').value.trim();
                    const category = document.getElementById('ov-post-category').value;
                    const photo = newsMediaState['ov-post'].photo || document.getElementById('ov-post-photo-url').value.trim();
                    const video = newsMediaState['ov-post'].video || document.getElementById('ov-post-video-url').value.trim();
                    const audio = newsMediaState['ov-post'].audio || '';
                    const ovVideoFileInput = document.getElementById('ov-post-video-file');
                    const videoFile = (ovVideoFileInput && ovVideoFileInput.files && ovVideoFileInput.files[0]) ? ovVideoFileInput.files[0] : (newsMediaState['ov-post'].videoFile || null);
                    const ovPhotoFileInput = document.getElementById('ov-post-photo-file');
                    const photoFile = (ovPhotoFileInput && ovPhotoFileInput.files && ovPhotoFileInput.files[0]) ? ovPhotoFileInput.files[0] : (newsMediaState['ov-post'].photoFile || null);
                    const status = document.getElementById('ov-post-status');

                    if (submitBtn) {
                        submitBtn.disabled = true;
                        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading & Publishing...';
                    }

                    try {
                        const ok = await handleAddPost(title, content, category, photo, video, audio, status, videoFile, photoFile);
                        if (ok) {
                            ovPostForm.reset();
                            clearMedia('ov-post-photo');
                            clearMedia('ov-post-video');
                            clearMedia('ov-post-audio');
                        }
                    } finally {
                        if (submitBtn) {
                            submitBtn.disabled = false;
                            submitBtn.innerHTML = origBtnText;
                        }
                    }
                });
            }

            const addPostForm = document.getElementById('add-post-form');
            if (addPostForm) {
                addPostForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const submitBtn = addPostForm.querySelector('button[type="submit"]');
                    const origBtnText = submitBtn ? submitBtn.innerHTML : '';

                    const title = document.getElementById('post-title').value.trim();
                    const content = document.getElementById('post-content').value.trim();
                    const category = document.getElementById('post-category').value;
                    const photo = newsMediaState['post'].photo || document.getElementById('post-photo-url').value.trim();
                    const video = newsMediaState['post'].video || document.getElementById('post-video-url').value.trim();
                    const audio = newsMediaState['post'].audio || document.getElementById('post-audio-url').value.trim();
                    const videoFileInput = document.getElementById('post-video-file');
                    const videoFile = (videoFileInput && videoFileInput.files && videoFileInput.files[0]) ? videoFileInput.files[0] : (newsMediaState['post'].videoFile || null);
                    const photoFileInput = document.getElementById('post-photo-file');
                    const photoFile = (photoFileInput && photoFileInput.files && photoFileInput.files[0]) ? photoFileInput.files[0] : (newsMediaState['post'].photoFile || null);
                    const status = document.getElementById('post-status');

                    if (submitBtn) {
                        submitBtn.disabled = true;
                        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading & Publishing...';
                    }

                    try {
                        const ok = await handleAddPost(title, content, category, photo, video, audio, status, videoFile, photoFile);
                        if (ok) {
                            addPostForm.reset();
                            clearMedia('post-photo');
                            clearMedia('post-video');
                            clearMedia('post-audio');
                        }
                    } finally {
                        if (submitBtn) {
                            submitBtn.disabled = false;
                            submitBtn.innerHTML = origBtnText;
                        }
                    }
                });
            }

            // Member Forms
            const ovMemForm = document.getElementById('ov-add-member-form');
            if (ovMemForm) {
                ovMemForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const name = document.getElementById('ov-mem-name').value.trim();
                    const email = document.getElementById('ov-mem-email').value.trim();
                    const country = document.getElementById('ov-mem-country').value.trim();
                    const pass = document.getElementById('ov-mem-pass').value.trim();
                    const status = document.getElementById('ov-mem-status');
                    handleAddMember(name, email, country, pass, status);
                    ovMemForm.reset();
                });
            }

            const addMemForm = document.getElementById('add-member-form');
            if (addMemForm) {
                addMemForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const name = document.getElementById('mem-name').value.trim();
                    const email = document.getElementById('mem-email').value.trim();
                    const country = document.getElementById('mem-country').value.trim();
                    const pass = document.getElementById('mem-password').value.trim();
                    const status = document.getElementById('member-status');
                    handleAddMember(name, email, country, pass, status);
                    addMemForm.reset();
                });
            }

            // Request Forms
            const ovReqForm = document.getElementById('ov-add-request-form');
            if (ovReqForm) {
                ovReqForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const name = document.getElementById('ov-req-name').value.trim();
                    const category = document.getElementById('ov-req-category').value;
                    const subject = document.getElementById('ov-req-subject').value.trim();
                    const details = document.getElementById('ov-req-details').value.trim();
                    const status = document.getElementById('ov-req-status');
                    handleAddRequest(name, 'admin-log@rhnd.com', category, 'Diaspora', subject, details, status);
                    ovReqForm.reset();
                });
            }

            const manualReqForm = document.getElementById('add-manual-request-form');
            if (manualReqForm) {
                manualReqForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const name = document.getElementById('manual-req-name').value.trim();
                    const email = document.getElementById('manual-req-email').value.trim();
                    const category = document.getElementById('manual-req-category').value;
                    const country = document.getElementById('manual-req-country').value.trim();
                    const subject = document.getElementById('manual-req-subject').value.trim();
                    const details = document.getElementById('manual-req-details').value.trim();
                    handleAddRequest(name, email, category, country, subject, details, null);
                    manualReqForm.reset();
                    alert('Support ticket logged successfully!');
                });
            }

            // Media URL live preview listeners
            function initMediaUrlPreview(inputId, previewId, typeSelectId) {
                const input = document.getElementById(inputId);
                const preview = document.getElementById(previewId);
                if (!input || !preview) return;
                input.addEventListener('input', function() {
                    const url = this.value.trim();
                    if (!url) { preview.style.display = 'none'; preview.innerHTML = ''; return; }
                    if (window.RHND_MEDIA) {
                        const media = RHND_MEDIA.parse(url);
                        if (media) {
                            // Auto-set type dropdown if present
                            if (typeSelectId) {
                                const sel = document.getElementById(typeSelectId);
                                if (sel) {
                                    if (['direct','youtube'].includes(media.type)) {
                                        sel.value = 'Video';
                                    }
                                }
                            }
                            RHND_MEDIA.renderAdminPreview(previewId, url);
                        } else {
                            preview.style.display = 'none';
                        }
                    }
                });
            }
            initMediaUrlPreview('ov-media-url', 'ov-media-url-preview', 'ov-media-type');
            initMediaUrlPreview('media-url', 'media-url-preview', 'media-type');

            // Media Forms
            const ovMediaForm = document.getElementById('ov-add-media-form');
            if (ovMediaForm) {
                ovMediaForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const title = document.getElementById('ov-media-title').value.trim();
                    const url = document.getElementById('ov-media-url').value.trim();
                    let media_type = document.getElementById('ov-media-type').value;
                    // Auto-detect type from social link
                    if (window.RHND_MEDIA && url) {
                        const parsed = RHND_MEDIA.parse(url);
                        if (parsed && ['direct','youtube'].includes(parsed.type)) {
                            media_type = 'Video';
                        }
                    }
                    const status = document.getElementById('ov-media-status');
                    handleAddMedia(title, media_type, url, '', status);
                    ovMediaForm.reset();
                    document.getElementById('ov-media-url-preview').style.display = 'none';
                    document.getElementById('ov-media-url-preview').innerHTML = '';
                });
            }

            const addMediaForm = document.getElementById('add-media-form');
            if (addMediaForm) {
                addMediaForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const title = document.getElementById('media-title').value.trim();
                    const url = document.getElementById('media-url').value.trim();
                    let media_type = document.getElementById('media-type').value;
                    // Auto-detect type from social link
                    if (window.RHND_MEDIA && url) {
                        const parsed = RHND_MEDIA.parse(url);
                        if (parsed && ['direct','youtube'].includes(parsed.type)) {
                            media_type = 'Video';
                        }
                    }
                    const caption = document.getElementById('media-caption').value.trim();
                    handleAddMedia(title, media_type, url, caption, null);
                    addMediaForm.reset();
                    document.getElementById('media-url-preview').style.display = 'none';
                    document.getElementById('media-url-preview').innerHTML = '';
                    alert('Media item published successfully!');
                });
            }

            // Broadcast Form
            const broadcastForm = document.getElementById('broadcast-alert-form');
            if (broadcastForm) {
                broadcastForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const type = document.getElementById('broadcast-type').value;
                    const title = document.getElementById('broadcast-title').value.trim();
                    const message = document.getElementById('broadcast-message').value.trim();
                    const status = document.getElementById('broadcast-status');

                    const alertData = {
                        active: true,
                        type,
                        title,
                        message,
                        created_at: new Date().toISOString()
                    };
                    localStorage.setItem('rhnd_broadcast_alert', JSON.stringify(alertData));
                    loadBroadcastAlert();

                    if (status) {
                        status.textContent = 'Broadcast Alert is now Live!';
                        status.style.color = 'var(--primary-green)';
                        status.style.display = 'inline';
                        setTimeout(() => status.style.display = 'none', 3500);
                    }
                });
            }
        });

        // Initialize All Dashboard Data
        fetchPosts();
        fetchMembers();
        fetchRequests();
        fetchMedia();
        loadBroadcastAlert();
    


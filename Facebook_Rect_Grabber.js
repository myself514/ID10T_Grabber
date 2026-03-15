// Facebook Reaction Grabber
// Paste this script into the browser's developer console (F12 -> Console) 
// while the Facebook reaction list popup is open.

function extractReactions() {
    const users = [];
    const dialogs = document.querySelectorAll('[role="dialog"]');
    const activeDialog = dialogs[dialogs.length - 1] || document; 
    const rows = activeDialog.querySelectorAll('[role="listitem"], div[data-visualcompletion="ignore-dynamic"]');
    const uniqueUsers = new Map();

    rows.forEach(row => {
        const img = row.querySelector('svg image, img');
        if (!img) return;

        let src = img.getAttribute('src') || img.getAttribute('href') || img.getAttribute('xlink:href');
        if (!src || src.includes('data:image') || src.includes('emoji') || src.includes('rsrc.php')) return; 

        let name = '';
        const links = row.querySelectorAll('a[role="link"]');
        for (let link of links) {
            let text = link.textContent.trim();
            if (text && text.length > 2 && isNaN(Number(text.replace(/,/g, ''))) && !['Message', 'Add friend', 'Following', 'All', 'More'].includes(text)) {
                name = text; break;
            }
        }
        if (!name) {
            const spans = row.querySelectorAll('span[dir="auto"]');
            for (let span of spans) {
                 let text = span.textContent.trim();
                 if (text && text.length > 2 && isNaN(Number(text.replace(/,/g, ''))) && !text.toLowerCase().includes('friend') && !['Message', 'Add friend', 'Following', 'All', 'More', 'Profile picture'].includes(text)) {
                     name = text; break;
                 }
            }
        }
        if (!name) {
            let current = img;
            for (let i = 0; i < 5; i++) {
                if (!current) break;
                let aria = current.getAttribute('aria-label');
                if (aria && aria.length > 2 && isNaN(Number(aria.replace(/,/g, ''))) && !['All', 'More', 'Like', 'Love', 'Care', 'Haha', 'Wow', 'Sad', 'Angry', 'Image', 'Close', 'Profile picture'].includes(aria)) {
                    name = aria; break;
                }
                current = current.parentElement;
            }
        }
        if (name && name !== 'Image' && name !== 'More' && name !== 'All' && src) {
            uniqueUsers.set(name, src);
        }
    });

    uniqueUsers.forEach((url, name) => {
        users.push({ Name: name, Picture: url });
    });

    console.table(users);
    generateImage(users);
}

async function generateImage(users) {
    const cols = 4; 
    const colW = 320; 
    const rowH = 80; 
    const pad = 40; 
    const size = 60;
    const rows = Math.ceil(users.length / cols);
    const cw = cols * colW + pad * 2; 
    const ch = rows * rowH + pad * 2 + 100;
    
    const canvas = document.createElement('canvas');
    canvas.width = cw; 
    canvas.height = ch;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#242526'; 
    ctx.fillRect(0, 0, cw, ch);
    
    ctx.fillStyle = '#E4E6EB'; 
    ctx.font = 'bold 36px Arial'; 
    ctx.textAlign = 'center';
    
    let selectedReaction = '';
    let globalEmoji = '';

    const selectedElements = document.querySelectorAll('[aria-selected="true"], [role="tab"]');
    for (let el of selectedElements) {
        // Skip if it's an unselected tab (when we have roles="tab")
        if (el.getAttribute('role') === 'tab' && el.getAttribute('aria-selected') !== 'true') {
            continue;
        }
        
        let label = (el.getAttribute('aria-label') || el.getAttribute('title') || el.alt || el.innerText || el.innerHTML || '').toLowerCase();
        if (label.includes('haha')) { globalEmoji = '😆'; break; }
        if (label.includes('love')) { globalEmoji = '❤️'; break; }
        if (label.includes('care')) { globalEmoji = '🥰'; break; }
        if (label.includes('wow'))  { globalEmoji = '😮'; break; }
        if (label.includes('sad'))  { globalEmoji = '😢'; break; }
        if (label.includes('angry')){ globalEmoji = '😡'; break; }
        // Simple regex to catch "like" but avoid matching words like "dislike" if they exist, or just check 'like'
        if (label.includes('like')) { globalEmoji = '👍'; break; }
    }

    if (globalEmoji) { 
        selectedReaction = globalEmoji + " - "; 
    }
    ctx.fillText(selectedReaction + "These are the " + users.length + " village 1d10ts", cw / 2, pad + 40);

    const loaded = await Promise.all(users.map((u, i) => new Promise(res => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => { res({img: img, name: u.Name, i: i}); };
        img.onerror = () => { res({img: null, name: u.Name, i: i}); };
        img.src = u.Picture;
    })));

    ctx.font = '24px Arial'; 
    ctx.textAlign = 'left'; 
    ctx.textBaseline = 'middle';
    
    loaded.forEach(item => {
        const r = Math.floor(item.i / cols); 
        const c = item.i % cols;
        const x = pad + c * colW + 20; 
        const y = pad + 100 + r * rowH;
        
        if (item.img) {
            ctx.save(); 
            ctx.beginPath();
            ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI*2);
            ctx.closePath(); 
            ctx.clip();
            ctx.drawImage(item.img, x, y, size, size);
            ctx.restore();
        } else {
            ctx.fillStyle = '#3A3B3C'; 
            ctx.beginPath();
            ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI*2); 
            ctx.fill();
        }

        // Draw small reaction emoji at bottom-right corner of the profile picture
        if (globalEmoji) {
            ctx.fillStyle = '#242526'; // Dark background ring to make it pop
            ctx.beginPath();
            ctx.arc(x + size - 8, y + size - 8, 14, 0, Math.PI*2);
            ctx.fill();
            
            ctx.font = '18px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(globalEmoji, x + size - 8, y + size - 8 + 1);
            
            // Reset text settings for names
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
        }

        ctx.font = '20px Arial'; 
        ctx.fillStyle = '#E4E6EB'; 
        ctx.fillText(item.name.substring(0, 20), x + size + 22, y + size/2);
    });

    const overlay = document.createElement('div');
    Object.assign(overlay.style, {
        position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh',
        background: 'rgba(0,0,0,0.95)', zIndex: '999999', display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'auto'
    });
    
    const msg = document.createElement('h2');
    msg.textContent = 'Right-click image -> "Copy Image", then paste in your comment!';
    msg.style.color = '#fff'; 
    msg.style.marginBottom = '20px';
    
    const close = document.createElement('button');
    close.textContent = 'Close Window'; 
    close.style.marginBottom = '20px'; 
    close.style.padding = '10px 20px';
    close.style.cursor = 'pointer';
    close.onclick = () => { document.body.removeChild(overlay); };
    
    let outImg = new Image();
    try { 
        outImg.src = canvas.toDataURL('image/png'); 
    } catch(e) { 
        outImg = canvas; 
    }
    Object.assign(outImg.style, { maxWidth: '90%', maxHeight: '80%', border: '2px solid #555', objectFit: 'contain' });
    
    overlay.appendChild(msg); 
    overlay.appendChild(close); 
    overlay.appendChild(outImg);
    document.body.appendChild(overlay);
}

async function autoScrollAndExtract() {
    console.log("Starting auto-scroll to load all users... Please wait.");
    let lastItemCount = 0;
    let retries = 0;
    while (retries < 3) {
        const dialogs = document.querySelectorAll('[role="dialog"]');
        const activeDialog = dialogs[dialogs.length - 1] || document;
        const listItems = activeDialog.querySelectorAll('img, svg image');
        const currentItemCount = listItems.length;
        if (currentItemCount > 0) {
            listItems[currentItemCount - 1].scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
        await new Promise(resolve => setTimeout(resolve, 1500));
        if (currentItemCount === lastItemCount) {
            retries++;
        } else {
            retries = 0; 
            lastItemCount = currentItemCount;
        }
    }
    console.log("Scrolling complete! Extracting data...");
    extractReactions();
}

autoScrollAndExtract();

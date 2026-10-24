import os
import zipfile

def create_zip(zip_filename, source_dir):
    with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        
        # 1. Write the custom .htaccess for Whogohost directly as a string
        htaccess_content = r'''<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /

    # Handle API routes
    RewriteRule ^api/(.*)$ api/index.php?route=$1 [L,QSA]

    # Specific Page Rewrites
    RewriteRule ^dashboard/?$ member-dashboard.html [L]
    RewriteRule ^members/?$ membership.html [L]

    # Prevent direct access to sensitive folders
    RewriteRule ^(config|src|templates|\.agents|\.vercel) - [F,L]
    RewriteRule ^(\.env|init\.sql|skills-lock\.json) - [F,L]
</IfModule>
'''
        zipf.writestr('.htaccess', htaccess_content)

        # 2. Walk through the directory
        for root, dirs, files in os.walk(source_dir):
            dirs[:] = [d for d in dirs if d not in ['.git', '.vercel', '.agents']]
            
            for file in files:
                if file.endswith('.zip') or file.endswith('.py') or file == '.htaccess':
                    continue
                
                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, source_dir).replace('\\', '/')
                
                if rel_path.startswith('public/'):
                    archive_path = rel_path[len('public/'):]
                else:
                    archive_path = rel_path
                
                zipf.write(file_path, archive_path)

create_zip('RHND_Whogohost_Complete.zip', '.')
print('Bulletproof Whogohost Zip created.')

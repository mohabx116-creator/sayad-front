$dirsToDelete = @(
    "src/views/pages/authentication/firebase",
    "src/views/pages/authentication/auth0",
    "src/views/pages/authentication/aws",
    "src/views/pages/authentication/supabase"
)
foreach ($d in $dirsToDelete) { if (Test-Path $d) { Remove-Item $d -Recurse -Force } }

$filesToDelete = @(
    "src/contexts/FirebaseContext.tsx",
    "src/contexts/Auth0Context.tsx",
    "src/contexts/AWSCognitoContext.tsx",
    "src/contexts/SupabaseContext.tsx"
)
foreach ($f in $filesToDelete) { if (Test-Path $f) { Remove-Item $f -Force } }

# Helper to remove lines matching regex
function Remove-Line ($file, $regex) {
    if (Test-Path $file) {
        $content = Get-Content $file
        $content = $content | Where-Object { $_ -notmatch $regex }
        Set-Content $file -Value $content
    }
}

function Replace-Text ($file, $old, $new) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $content = $content -replace $old, $new
        Set-Content $file -Value $content -NoNewline
    }
}

$authPages = Get-ChildItem -Path "src/views/pages/authentication" -File -Recurse -Include *.tsx

foreach ($file in $authPages) {
    Replace-Text $file.FullName "'firebase' | 'jwt' | 'aws' | 'auth0' | 'supabase'" "'jwt'"
    Remove-Line $file.FullName "firebase:"
    Remove-Line $file.FullName "auth0:"
    Remove-Line $file.FullName "aws:"
    Remove-Line $file.FullName "supabase:"
    Remove-Line $file.FullName "import Firebase from"
    Remove-Line $file.FullName "import Auth0 from"
    Remove-Line $file.FullName "import Supabase from"
    Remove-Line $file.FullName "APP_AUTH === AuthProvider.FIREBASE"
    Remove-Line $file.FullName "APP_AUTH === AuthProvider.AUTH0"
    Remove-Line $file.FullName "APP_AUTH === AuthProvider.SUPABASE"
    Remove-Line $file.FullName "{ name: 'firebase'"
    Remove-Line $file.FullName "{ name: 'auth0'"
    Remove-Line $file.FullName "{ name: 'supabase'"
}

# Fix config.ts
Replace-Text "src/config.ts" "FIREBASE = 'firebase',\s*JWT = 'jwt',\s*AWS = 'aws',\s*AUTH0 = 'auth0',\s*SUPABASE = 'supabase'" "JWT = 'jwt'"

# Fix auth.ts - this file is complex, we might just need to strip the Firebase/AWS/Auth0/Supabase exports.
# Let's just do a rough replace.
Remove-Line "src/types/auth.ts" "firebase"
Remove-Line "src/types/auth.ts" "auth0"
Remove-Line "src/types/auth.ts" "cognito"
Remove-Line "src/types/auth.ts" "supabase"
Remove-Line "src/types/auth.ts" "FirebaseContextType"
Remove-Line "src/types/auth.ts" "Auth0ContextType"
Remove-Line "src/types/auth.ts" "AWSCognitoContextType"
Remove-Line "src/types/auth.ts" "SupabaseContextType"

# Fix hooks/useAuth.ts
Remove-Line "src/hooks/useAuth.ts" "contexts/FirebaseContext"
Remove-Line "src/hooks/useAuth.ts" "contexts/Auth0Context"
Remove-Line "src/hooks/useAuth.ts" "contexts/AWSCognitoContext"
Remove-Line "src/hooks/useAuth.ts" "contexts/SupabaseContext"

# Fix App.tsx
Remove-Line "src/App.tsx" "contexts/FirebaseContext"
Remove-Line "src/App.tsx" "contexts/Auth0Context"
Remove-Line "src/App.tsx" "contexts/AWSCognitoContext"
Remove-Line "src/App.tsx" "contexts/SupabaseContext"

# Fix ViewOnlyAlert.tsx switch cases
Remove-Line "src/views/pages/authentication/ViewOnlyAlert.tsx" "case 'firebase':"
Remove-Line "src/views/pages/authentication/ViewOnlyAlert.tsx" "case 'auth0':"
Remove-Line "src/views/pages/authentication/ViewOnlyAlert.tsx" "case 'aws':"
Remove-Line "src/views/pages/authentication/ViewOnlyAlert.tsx" "case 'supabase':"
Remove-Line "src/views/pages/authentication/ViewOnlyAlert.tsx" "berry/authentication/firebase"
Remove-Line "src/views/pages/authentication/ViewOnlyAlert.tsx" "berry/authentication/auth0"
Remove-Line "src/views/pages/authentication/ViewOnlyAlert.tsx" "berry/authentication/aws-cognito"
Remove-Line "src/views/pages/authentication/ViewOnlyAlert.tsx" "berry/authentication/supabase"

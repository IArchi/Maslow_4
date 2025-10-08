import subprocess
import filecmp, tempfile, shutil, os

# Thank you https://docs.platformio.org/en/latest/projectconf/section_env_build.html !

gitFail = False
try:
    subprocess.check_call(["git", "status"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
except:
    gitFail = True

if gitFail:
    tag = "v3.0.x"
    rev = " (noGit)"
else:
    try:
        # Use git describe --tags --always to get full version info
        # This returns tag-count-hash (e.g., v1.12-58-gabcd) or just hash if no tags
        tag = (
            subprocess.check_output(["git", "describe", "--tags", "--always"], stderr=subprocess.DEVNULL)
            .strip()
            .decode("utf-8")
        )
        # If tag already contains the count-hash format, don't add more info
        if '-' in tag and tag[0] == 'v':
            rev = ''
        else:
            # No tag found (just a hash), fall back to v3.0.x with branch info
            tag = "v3.0.x"
            branchname = (
                subprocess.check_output(["git", "rev-parse", "--abbrev-ref", "HEAD"])
                .strip()
                .decode("utf-8")
            )
            revision = (
                subprocess.check_output(["git", "rev-parse", "--short", "HEAD"])
                .strip()
                .decode("utf-8")
            )
            modified = (
                subprocess.check_output(["git", "status", "-uno", "-s"])
                .strip()
                .decode("utf-8")
            )
            if modified:
                dirty = "-dirty"
            else:
                dirty = ""
            rev = " (%s-%s%s)" % (branchname, revision, dirty)
    except:
        tag = "v3.0.x"
        rev = ""

# Extract grbl_version (major.minor) from tag
# For tag-count-hash format like v1.12-58-gabcd, extract just v1.12 first
tag_base = tag.split('-')[0] if '-' in tag else tag
tag_no_v = tag_base.replace('v', '')
parts = tag_no_v.split('.')
if len(parts) >= 2:
    grbl_version = f'{parts[0]}.{parts[1]}'
else:
    grbl_version = parts[0] if parts else '3.0'
git_info = '%s%s' % (tag, rev)

provisional = "FluidNC/src/version.cxx"
final = "FluidNC/src/version.cpp"
with open(provisional, "w") as fp:
    fp.write('const char* grbl_version = \"' + grbl_version + '\";\n')
    fp.write('const char* git_info     = \"' + git_info + '\";\n')

if not os.path.exists(final):
    # No version.cpp so rename version.cxx to version.cpp
    os.rename(provisional, final)
elif not filecmp.cmp(provisional, final):
    # version.cxx differs from version.cpp so get rid of the
    # old .cpp and rename .cxx to .cpp
    os.remove(final)
    os.rename(provisional, final)
else:
    # The existing version.cpp is the same as the new version.cxx
    # so we can just leave the old version.cpp in place and get
    # rid of version.cxx
    os.remove(provisional)

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
    # Use git describe --tags --always to get the version
    # This will return:
    # - The tag name if current commit is tagged
    # - tag-count-hash if current commit is not tagged but there are tags
    # - Just the commit hash if there are no tags at all
    try:
        describe_output = (
            subprocess.check_output(["git", "describe", "--tags", "--always"], stderr=subprocess.DEVNULL)
            .strip()
            .decode("utf-8")
        )
        
        # Check if the current commit is exactly tagged
        try:
            subprocess.check_call(["git", "describe", "--tags", "--exact-match"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            # Current commit is tagged - use the tag as-is with no extra info
            tag = describe_output
            rev = ''
        except:
            # Current commit is not tagged
            # Check if describe_output contains a tag (format: tag-count-hash)
            if '-' in describe_output and describe_output.startswith('v'):
                # Format is tag-count-hash, use it as-is (already has all info we need)
                tag = describe_output
                rev = ''
            elif '-' in describe_output and not describe_output.startswith('v'):
                # Looks like tag-count-hash but doesn't start with 'v', likely just a hash
                # Fall back to v3.0.x with branch info
                tag = "v3.0.x"
                branchname = (
                    subprocess.check_output(["git", "rev-parse", "--abbrev-ref", "HEAD"])
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
                rev = " (%s-%s%s)" % (branchname, describe_output[:7], dirty)
            else:
                # Just a commit hash, no tags in history
                tag = "v3.0.x"
                branchname = (
                    subprocess.check_output(["git", "rev-parse", "--abbrev-ref", "HEAD"])
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
                rev = " (%s-%s%s)" % (branchname, describe_output[:7], dirty)
    except:
        # Fallback if git describe fails
        tag = "v3.0.x"
        try:
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
            rev = " (unknown)"

# Extract grbl_version (major.minor) from tag
# For tags like v3.3.3 -> 3.3
# For tags like v1.12 -> 1.12
# For tags like v1.12-58-g109ff1ec -> 1.12
tag_without_v = tag.replace('v', '')
tag_base = tag_without_v.split('-')[0]  # Remove -count-hash if present
version_parts = tag_base.split('.')
if len(version_parts) >= 2:
    grbl_version = f"{version_parts[0]}.{version_parts[1]}"
else:
    grbl_version = version_parts[0]
    
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

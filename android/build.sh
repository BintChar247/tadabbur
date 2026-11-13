set -e
SDK=${ANDROID_JAR:-/usr/lib/android-sdk/platforms/android-23/android.jar}
rm -rf build && mkdir -p build/gen build/classes build/dex
aapt package -f -m -J build/gen -M AndroidManifest.xml -S res -I $SDK
javac --release 8 -nowarn -d build/classes -classpath $SDK -sourcepath "src:build/gen" src/com/surah/shuara/*.java build/gen/com/surah/shuara/R.java 2>&1 | grep -v "^warning\|^Note" || true
dalvik-exchange --dex --output=build/dex/classes.dex build/classes
aapt package -f -M AndroidManifest.xml -S res -A assets -I $SDK -F build/unsigned.apk -0 arsc -0 woff2
cp build/dex/classes.dex build/ && (cd build && aapt add unsigned.apk classes.dex >/dev/null)
zipalign -p -f 4 build/unsigned.apk build/aligned.apk
[ -f release.jks ] || { echo "release.jks not found: create your own signing key (see README)"; exit 1; }
apksigner sign --ks release.jks --ks-pass env:KS_PASS --key-pass env:KS_PASS --ks-key-alias shuara --out build/Tadabbur.apk build/aligned.apk
apksigner verify -v build/Tadabbur.apk | head -5
ls -la build/Tadabbur.apk

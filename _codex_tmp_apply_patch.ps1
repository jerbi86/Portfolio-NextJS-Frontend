$patch = @"*** Begin Patch
*** Add File: tmp_test.txt
+hello
*** End Patch
"@
$patch | apply_patch

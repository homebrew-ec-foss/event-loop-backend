# Define the source file path and the destination directory
$sourceFile = "C:\Users\Adhesh\Desktop\projects\eventloop\event-loop-backend\test-data\qr-png\username@gmail.com-NAME_ABC-b72fad1b-7832-56dc-9327-ab1f3f03c18e.png"
$destinationDir = "C:\Users\Adhesh\Desktop\projects\eventloop\event-loop-backend\test-data\qr-png\"

# Ensure the destination directory exists
if (-not (Test-Path $destinationDir)) {
    New-Item -ItemType Directory -Path $destinationDir
}

# Loop to copy the file 200 times
for ($i = 1; $i -le 200; $i++) {
    # Construct the new file name
    $newFileName = "username@gmail.com-NAME_ABC-b72fad1b-7832-56dc-9327-ab1f3f03c18e($i).png"
    $destinationFile = Join-Path -Path $destinationDir -ChildPath $newFileName

    # Copy the file
    Copy-Item -Path $sourceFile -Destination $destinationFile
}

Write-Output "File replicated 200 times successfully."

# Character Image Guide

This guide shows how to take a character image from ChatGPT and turn it into a clean file for the `Community Verse Games` project.

## Goal

Each character portrait should be:

- `JPG`
- `RGB`
- `800 x 1000`
- portrait shape
- named in lowercase with hyphens

Example:

- `smiley-boy.jpg`
- `johnny-pepper.jpg`
- `angel-sweet.jpg`

## Best Free Tool

Use [Photopea](https://www.photopea.com)

Photopea works in a web browser and feels a lot like Photoshop.

## Step By Step

### 1. Save the image from ChatGPT

After ChatGPT creates the image:

1. Save the image to your computer.
2. Put it somewhere easy to find, like `Downloads` or `Desktop`.

### 2. Open Photopea

1. Open [Photopea](https://www.photopea.com)
2. Click `Open From Computer`
3. Choose the image you saved

### 3. Crop it to the right shape

1. Click the `Crop Tool` on the left side
2. At the top of the screen, set the crop ratio to `4 : 5`
3. Move the crop box so the character’s face and upper body look centered
4. Press `Enter`

This gives the portrait a good card-style shape.

## 4. Resize the image

1. Click `Image`
2. Click `Image Size`
3. Type `800` for the width
4. The height should become `1000`
5. Click `OK`

## 5. Export as JPG

1. Click `File`
2. Click `Export As`
3. Click `JPG`
4. Set the quality to about `80` to `90`
5. Click `Save`

## 6. Name the file correctly

Use the **character name turned into lowercase kebab-case**:

- lowercase letters
- hyphens instead of spaces
- remove quote marks and punctuation

Examples:

- `Smiley Boy` becomes `smiley-boy.jpg`
- `Renee "Potato Salad" Long` becomes `renee-potato-salad-long.jpg`
- `The Muffin Man` becomes `the-muffin-man.jpg`
- `Doctor Dolittle` becomes `doctor-dolittle.jpg`

This matters because the roster page now looks for the image automatically based on the character name.

## 7. Put the file in the correct folder on your computer

Save the finished image in:

- `/Users/timcollins/Documents/Zoo Game/assets/characters/staff`

If the character is not staff later, we can make more folders.

## 8. Upload it to the website if you want it to show online

If you want the picture to appear on the live website, upload the same file in cPanel to:

- `public_html/zoo/assets/characters/staff`

That means you usually want the same image in two places:

- on your computer in the `Zoo Game` project folder
- on the website in the matching `public_html/zoo/assets/characters/staff` folder

## 9. The roster page can now load staff portraits automatically

The character roster page now tries to load a portrait automatically from:

- `./assets/characters/staff/character-name.jpg`

It also tries `.png` as a backup.

So for a new character like `The Muffin Man`, if you upload:

- `the-muffin-man.jpg`

or

- `the-muffin-man.png`

into the correct staff folder, the roster page should show it automatically without any extra page edit.

## Example for Muffin Man

A good filename would be:

- `the-muffin-man.jpg`

Save it here on your computer:

- `/Users/timcollins/Documents/Zoo Game/assets/characters/staff/the-muffin-man.jpg`

Upload it here on the website:

- `public_html/zoo/assets/characters/staff/the-muffin-man.jpg`

Then reload the roster page. If the filename matches the character name in kebab-case, it should appear automatically.

## File Size Tips

Try to keep each image:

- under `1 MB`
- preferably under `500 KB` if possible

If the file is too large:

1. Export again as `JPG`
2. Lower the quality a little
3. Try `80` instead of `90`

## Quick Version

1. Save image from ChatGPT
2. Open it in Photopea
3. Crop to `4:5`
4. Resize to `800 x 1000`
5. Export as `JPG`
6. Name it correctly
7. Save it in `assets/characters/staff` on your computer
8. Upload it to `public_html/zoo/assets/characters/staff` in cPanel
9. Reload the roster page and it should appear automatically if the filename matches the character name

## Current Standard

- Format: `JPG`
- Color: `RGB`
- Size: `800 x 1000`
- Shape: `4:5`
- Folder: `assets/characters/staff`

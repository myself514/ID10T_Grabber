# Facebook Reaction Grabber

This script automatically scrolls through an open Facebook reaction list popup, extracts the names and profile pictures of the users who reacted, and generates a clean, formatted image grid of those users.

## How to Use (Bookmarklet Method - Recommended)

1. **Create the Bookmarklet:**
   - Create a new bookmark in your browser's bookmarks bar (you can name it "FB Reaction Grabber" or similar).
   - Edit the newly created bookmark.
   - In the **URL** (or Address) field, clear the existing URL and paste the full `javascript:(function(){...})();` one-line script.
   
2. **Run the Script:**
   - Go to Facebook and find a post.
   - Click on the reaction summary (e.g., the 👍😆❤️ icons) to open the **Reaction List popup dialog**.
   - If you want a specific reaction (e.g., only "Haha" reactions), click that specific tab at the top of the dialog. The script automatically detects the selected emoji.
   - Click the your new bookmarklet from your bookmarks bar.
   - The script will start automatically scrolling to load all users on that list. *Please wait until it finishes.*
   - Once complete, a dark overlay will appear containing the generated image grid.

3. **Save/Copy the Image:**
   - Right-click the generated image.
   - Select **"Copy Image"** to paste it directly into a comment, or **"Save Image As..."** to save it to your computer.
   - Click "Close Window" to remove the overlay and return to Facebook.

## How to Use (Developer Console Method)

If you don't want to use a bookmarklet, you can run the raw code directly:

1. Open the Facebook post and open the **Reaction List popup dialog**.
2. Select the desired reaction tab.
3. Press `F12` on your keyboard to open the browser's Developer Tools.
4. Navigate to the **Console** tab.
5. Open the `Facebook_Rect_Grabber.js` file, copy all of the code, and paste it into the Console input.
6. Press **Enter**.
7. Wait for the auto-scrolling to finish and the image grid to appear on your screen.

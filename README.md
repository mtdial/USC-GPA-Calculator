
# USC GPA Calculator with Grade Forgiveness

A simple, static web app that lets USC students project their cumulative GPA and simulate Grade Forgiveness, built for the University Advising Center.

- Brand: USC Garnet and Black with UAC logo
- Grades supported: A, B+, B, C+, C, D+, D, F, WF, FN
- Grade Forgiveness: Up to two courses and not more than 8 credits (USC Columbia and Palmetto College)

## Quick start (GitHub Pages)

1. **Create a new repository on GitHub** named `usc-gpa-calculator` (or any name you like).
2. Download the files from this folder and upload them to your repo:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `assets/uac_logo.png` ← included
3. Commit the changes to the **main** branch.
4. Go to **Settings → Pages**.
5. Under **Build and deployment**, set **Source** to **Deploy from a branch**.  
   Select **Branch:** `main` and **Folder:** `/ (root)`. Click **Save`**.
6. After the build finishes, GitHub will display your site URL on the Pages screen. Share that link with students and advisors.

### Local testing

Just open `index.html` in a browser. No build tools required.

## How to use the calculator

1. In **Current transcript totals**, enter your **Cumulative GPA Hours** and **Cumulative Quality Points** from the Transcript Totals box in Self Service Carolina.
2. In **Planned or current term**, add each course with credit hours and the actual or expected grade.
3. In **Grade Forgiveness**, enter the first attempt hours and grade, then the second attempt grade. Check the box if the second attempt is already included in your term list above.
4. Review both result tiles: **Projected Cumulative GPA (no forgiveness)** and **Projected Cumulative GPA (with forgiveness)**.

## Policy notes

- This tool follows the USC **Registrar Grade Forgiveness** policy (Columbia and Palmetto College): up to **two courses** not to exceed **8 credits**. Only the second grade is used in GPA, and the original attempt's GPA hours and quality points are removed. Eligible first attempts are **D+, D, F, or WF**.
- Some programs (for example Nursing) do not apply grade forgiveness to selective or progression GPAs. Always check your program rules.

Sources:
- Registrar: https://sc.edu/about/offices_and_divisions/registrar/transcripts_and_records/grade_forgiveness/
- Undergraduate Academic Regulations: https://academicbulletins.sc.edu/undergraduate/policies-regulations/undergraduate-academic-regulations/

## Accessibility

- Large tap targets and labels for all inputs
- High-contrast palette using **Garnet** and **Black**
- Live region notices for policy warnings

## Customize

- Update `assets/uac_logo.png` with a different logo file if needed.
- Add or remove course rows by editing `app.js`.
- If USC updates the grade scale, update the `gradePoints` map.

## Contact

University Advising Center — University of South Carolina

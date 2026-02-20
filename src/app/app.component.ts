# Create the missing file locally if it's gone
ng generate component app --flat --skip-tests
# Then commit and push
git add .
git commit -m "Restore app.component.ts"
git push

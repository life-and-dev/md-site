Consider the last changes you made to the codebase:

Think carefully about it: Is this the most optimal solution.

Performance:
* Avoid unnecessary data transformations.
* Optimize expensive calculations.
* Do not load unnecessary data into memory.

Maintainability:
* Split large files (1000+ lines) into smaller files
* Organize related code functions and types together

Consider improvements and how the code could potentially be refactored without changing the functionality.

Keep TODO comments that are relevant for future work
Keep comments that explain complex logic

But clean up all:
* temporary files
* debugging statements
* commented-out code
* unused imports
* redundant code
* duplicate validations
* unnecessary data object transformations

Merge helper functions that are similiar in functionality.
Merge or extend similiar interfaces and types.

Ensure that the description of each section is still relevant to the current code.
Ensure all unit tests and lint tests still passes after the refactoring.
